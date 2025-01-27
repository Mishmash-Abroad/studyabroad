from django.core.management.base import BaseCommand
from rest_framework.test import APIClient
from django.utils.timezone import now
from datetime import timedelta
from api.models import Program, User, Application, ApplicationQuestion, ApplicationResponse
from django.db import transaction


class Command(BaseCommand):
    help = "Test API endpoints with wide coverage."

    def handle(self, *args, **options):
        self.stdout.write("Starting API endpoint tests...")
        try:
            with transaction.atomic():  # Ensures all database changes are reverted after the test
                self.run_tests()
                raise RuntimeError("Rollback after testing.")  # Forces a rollback
        except RuntimeError as e:
            if str(e) == "Rollback after testing.":
                self.stdout.write(self.style.SUCCESS("All tests completed and database changes reverted."))
            else:
                self.stdout.write(self.style.ERROR(f"Unexpected error: {e}"))

    def run_tests(self):
        client = APIClient()

        # Test Users and Authentication
        self.stdout.write("Testing user authentication endpoints...")
        self.test_user_endpoints(client)

        # Test Programs
        self.stdout.write("Testing program endpoints...")
        self.test_program_endpoints(client)

        # Test Applications
        self.stdout.write("Testing application endpoints...")
        self.test_application_endpoints(client)

        # Test Application Questions
        self.stdout.write("Testing application question endpoints...")
        self.test_question_endpoints(client)

        # Test Application Responses
        self.stdout.write("Testing application response endpoints...")
        self.test_response_endpoints(client)

    def test_user_endpoints(self, client):
        # Attempt login with a non-existent user
        response = client.post("/api/login/", {"username": "test_user", "password": "password"})
        assert response.status_code == 401, "Login should fail for non-existent user."

        # Register and login as a new user
        user = User.objects.create_user(username="test_user", password="password", email="test@test.com")
        response = client.post("/api/login/", {"username": "test_user", "password": "password"})
        assert response.status_code == 200, "Login failed for created user."
        token = response.data["token"]
        client.credentials(HTTP_AUTHORIZATION=f"Token {token}")

        # Fetch current user details
        response = client.get("/api/users/me/")
        assert response.status_code == 200, "Fetching current user details failed."

    def test_program_endpoints(self, client):
        admin = User.objects.get(username="admin")
        client.force_authenticate(user=admin)

        # Create a program
        program_data = {
            "title": "Test Program",
            "year_semester": "2025 Fall",
            "description": "A program for testing.",
            "faculty_leads": "Test Faculty",
            "application_open_date": now().date(),
            "application_deadline": now().date(),
            "start_date": now().date(),
            "end_date": now().date(),
        }
        response = client.post("/api/programs/", program_data)
        assert response.status_code == 201, "Creating a new program failed."
        program_id = response.data["id"]

        # Fetch all programs (anonymous user)
        client.force_authenticate(user=None)
        response = client.get("/api/programs/")
        assert response.status_code == 200, "Fetching programs failed."

        # Update the program as admin
        client.force_authenticate(user=admin)
        response = client.patch(f"/api/programs/{program_id}/", {"description": "Updated description."})
        assert response.status_code == 200, "Updating a program failed."

        # Delete the program
        response = client.delete(f"/api/programs/{program_id}/")
        assert response.status_code == 204, "Deleting a program failed."

    def test_application_endpoints(self, client):
        user = User.objects.get(username="test_user")
        client.force_authenticate(user=user)

        # Create a program with a future application deadline
        from datetime import timedelta
        future_date = now().date() + timedelta(days=10)  # Deadline 10 days in the future
        program = Program.objects.create(
            title="Test Program",
            year_semester="2025 Spring",
            description="A program for testing applications.",
            faculty_leads="Test Faculty",
            application_open_date=now().date(),
            application_deadline=future_date,
            start_date=future_date + timedelta(days=20),
            end_date=future_date + timedelta(days=50),
        )

        # Submit an application for the program
        application_data = {
            "student": user.id,
            "program": program.id,
            "date_of_birth": "2000-01-01",
            "gpa": 3.8,
            "major": "Computer Science",
            "status": "Applied",
        }
        response = client.post("/api/applications/", application_data)
        assert response.status_code == 201, "Submitting a new application failed."

        # Cancel the application
        application_id = response.data["id"]
        response = client.patch(f"/api/applications/{application_id}/", {"status": "Canceled"})
        assert response.status_code == 200, "Canceling an application failed."


    def test_question_endpoints(self, client):
        admin = User.objects.get(username="admin")
        client.force_authenticate(user=admin)

        # Create an application question
        program = Program.objects.first()
        question_data = {
            "text": "Why do you want to study abroad?",
            "program": program.id,
            "is_required": True,
        }
        response = client.post("/api/questions/", question_data)
        assert response.status_code == 201, "Creating a new question failed."
        question_id = response.data["id"]

        # Delete the question
        response = client.delete(f"/api/questions/{question_id}/")
        assert response.status_code == 204, "Deleting a question failed."

    def test_response_endpoints(self, client):
        user = User.objects.get(username="test_user")
        client.force_authenticate(user=user)

        # Create an application and question
        application = Application.objects.create(
            student=user,
            program=Program.objects.first(),
            date_of_birth="2000-01-01",
            gpa=3.8,
            major="Computer Science",
            status="Applied",
        )
        question = ApplicationQuestion.objects.create(
            text="Why do you want to study abroad?",
            program=application.program,
            is_required=True,
        )

        # Submit an application response
        response_data = {"application": application.id, "question": question.id, "response": "To gain experience."}
        response = client.post("/api/responses/", response_data)

        assert response.status_code == 201, "Submitting an application response failed."
        response_id = response.data["id"]

        # Update the response
        response = client.patch(f"/api/responses/{response_id}/", {"response": "To gain global experience."})

        assert response.status_code == 200, "Updating an application response failed."

