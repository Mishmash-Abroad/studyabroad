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

        total_tests = 0
        passed_tests = 0
        failed_tests = 0
        warnings = 0

        # Test Users and Authentication
        self.stdout.write("Testing user authentication endpoints...")
        t, p, f, w = self.test_user_endpoints(client)
        total_tests += t
        passed_tests += p
        failed_tests += f
        warnings += w

        # Test Programs
        self.stdout.write("Testing program endpoints...")
        t, p, f, w = self.test_program_endpoints(client)
        total_tests += t
        passed_tests += p
        failed_tests += f
        warnings += w

        # Test Applications
        self.stdout.write("Testing application endpoints...")
        t, p, f, w = self.test_application_endpoints(client)
        total_tests += t
        passed_tests += p
        failed_tests += f
        warnings += w

        # Test Application Questions
        self.stdout.write("Testing application question endpoints...")
        t, p, f, w = self.test_question_endpoints(client)
        total_tests += t
        passed_tests += p
        failed_tests += f
        warnings += w

        # Test Application Responses
        self.stdout.write("Testing application response endpoints...")
        t, p, f, w = self.test_response_endpoints(client)
        total_tests += t
        passed_tests += p
        failed_tests += f
        warnings += w

        # Test Announcement Responses
        self.stdout.write("Testing announcement endpoints...")
        t, p, f, w = self.test_announcement_endpoints(client)
        total_tests += t
        passed_tests += p
        failed_tests += f
        warnings += w

        # Test Confidential Notes Responses
        self.stdout.write("Testing confidential notes endpoints...")
        t, p, f, w = self.test_notes_endpoints(client)
        total_tests += t
        passed_tests += p
        failed_tests += f
        warnings += w

        # Overall Summary Report
        print("\n==================== OVERALL TEST SUMMARY =========================")
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Warnings: {warnings}")
        print("===================================================================")


    @staticmethod
    def check_response(response, expected_status, *, success_message, error_message, total_tests=None, passed_tests=None, failed_tests=None, warnings=None):
        """Helper function to check response and track results."""
        total_tests[0] += 1

        if response.status_code == expected_status:
            print(f"PASSED: {success_message}")
            passed_tests[0] += 1
        else:
            print(f"FAILED: {error_message} (Received {response.status_code})")
            failed_tests[0] += 1

        if response.status_code >= 400:
            try:
                error_data = response.json()
                if "detail" not in error_data or not isinstance(error_data.get("detail"), str):
                    print(f"WARNING: Expected an 'detail' key in the response, but it was missing or not a string.")
                    warnings[0] += 1
            except Exception:
                print(f"WARNING: Expected JSON error response, but got non-JSON response (likely an HTML error page).")
                warnings[0] += 1

    def test_user_endpoints(self, client):
        """
        API Endpoints:
        Method  Endpoint                          Description                     Permission Classes             Arguments                 Expected Response                              Errors
        GET     /api/users/                       List all users                  IsAuthenticated, IsAdminOrSelf None                      List of users (admin), self (student)          403 if unauthorized
        GET     /api/users/{id}/                  Retrieve specific user          IsAuthenticated, IsAdminOrSelf id                        User details                                   403 if unauthorized, 404 if not found
        GET     /api/users/current_user/          Get current user                IsAuthenticated                None                      User details                                   401 if not authenticated
        POST    /api/users/signup/                Register a new user             AllowAny                       username, password        {"token":"<auth_token>","user":{user details}} 400 if missing credentials
        POST    /api/users/login/                 Authenticate user               AllowAny                       username, password        {"token":"<auth_token>","user":{user details}} 401 if invalid credentials
        POST    /api/users/logout/                Logout user                     IsAuthenticated                None                      {"detail":"Successfully logged out"}           400 if already logged out
        PATCH   /api/users/change_password/       Change current user's password  IsAuthenticated                password, confirmPassword {"detail":"Password changed successfully"}      400 if passwords don't match
        """

        total_tests = [0]
        passed_tests = [0]
        failed_tests = [0]
        warnings = [0]

        # Attempt login with a non-existent user
        response = client.post("/api/users/login/", {"username": "invalid_user", "password": "password"})
        Command.check_response(response, 401, success_message="Login failed for non-existent user as expected.",
                    error_message="Login did not fail for non-existent user.",
                    total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Register a new user
        response = client.post("/api/users/signup/", {
            "username": "test_user",
            "password": "password",
            "display_name": "Test User",
            "email": "test@test.com"
        })
        Command.check_response(response, 201, success_message="User registration succeeded.",
                    error_message="User registration failed.",
                    total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        user_id = response.data.get("user", {}).get("id")

        # Login with the new user
        response = client.post("/api/users/login/", {"username": "test_user", "password": "password"})
        Command.check_response(response, 200, success_message="Login succeeded for registered user.",
                    error_message="Login failed for registered user.",
                    total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        token = response.data.get("token")
        client.credentials(HTTP_AUTHORIZATION=f"Token {token}")

        # Fetch current user details
        response = client.get("/api/users/current_user/")
        Command.check_response(response, 200, success_message="Fetching current user details succeeded.",
                    error_message="Fetching current user details failed.",
                    total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Logout user
        response = client.post("/api/users/logout/")
        Command.check_response(response, 200, success_message="Logout successful.",
                    error_message="Logout failed.",
                    total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)
        
        client.credentials()

        # Attempt to fetch current user details after logout
        response = client.get("/api/users/current_user/")
        Command.check_response(response, 401, success_message="Fetching user details failed after logout as expected.",
                    error_message="Fetching user details should have failed after logout.",
                    total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Change password (while logged out)
        response = client.patch("/api/users/change_password/", {"password": "newpassword", "confirm_password": "newpassword"})
        Command.check_response(response, 401, success_message="Changing password failed as expected when not authenticated.",
                    error_message="Changing password should have failed when not authenticated.",
                    total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Re-login with old password and change it
        response = client.post("/api/users/login/", {"username": "test_user", "password": "password"})
        Command.check_response(response, 200, success_message="Re-login after logout succeeded.",
                    error_message="Re-login after logout failed.",
                    total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        token = response.data.get("token")
        client.credentials(HTTP_AUTHORIZATION=f"Token {token}")

        response = client.patch("/api/users/change_password/", {"password": "newpassword", "confirm_password": "newpassword"})
        Command.check_response(response, 200, success_message="Password change successful.",
                    error_message="Password change failed.",
                    total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Attempt to log in with old password (should fail)
        response = client.post("/api/users/login/", {"username": "test_user", "password": "password"})
        Command.check_response(response, 401, success_message="Old password no longer works after password change, as expected.",
                    error_message="Old password still works after password change.",
                    total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Login with the new password
        response = client.post("/api/users/login/", {"username": "test_user", "password": "newpassword"})
        Command.check_response(response, 200, success_message="Login succeeded with new password.",
                    error_message="Login failed with new password.",
                    total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Attempt to change password with mismatched confirmPassword
        response = client.patch("/api/users/change_password/", {"password": "mismatch", "confirm_password": "wrong"})
        Command.check_response(response, 400, success_message="Password change failed as expected due to mismatch.",
                    error_message="Password change should have failed due to mismatch.",
                    total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)


        # Summary Report
        print("\n================== USER TEST SUMMARY =================")
        print(f"Total Tests: {total_tests[0]}")
        print(f"Passed: {passed_tests[0]}")
        print(f"Failed: {failed_tests[0]}")
        print(f"Warnings: {warnings[0]}")
        print("======================================================")

        return total_tests[0], passed_tests[0], failed_tests[0], warnings[0]

    def test_program_endpoints(self, client):
        '''
        API Endpoints:
        Method Endpoint                               Description                            Permission Classes         Arguments                      Expected Response                                    Errors
        GET    /api/programs/                         List all programs                      IsAdminOrReadOnly          search=<string> (optional)    List of programs                                    None
        POST   /api/programs/                         Create a new program                   IsAdminOrReadOnly          Program fields (JSON)         Created program details                            403 if unauthorized
        GET    /api/programs/{id}/                    Retrieve specific program              IsAdminOrReadOnly          id (Program ID)               Program details                                    404 if not found
        PUT    /api/programs/{id}/                    Update existing program                IsAdminOrReadOnly          Updated program fields (JSON) Updated program details                            403 if unauthorized, 404 if not found
        DELETE /api/programs/{id}/                    Delete a program                       IsAdminOrReadOnly          id (Program ID)               204 No Content                                    403 if unauthorized, 404 if not found
        GET    /api/programs/{id}/application_status/ Get user's application status          IsAuthenticated            id (Program ID)               {"status":"Applied","application_id":12}          401 if not authenticated
        GET    /api/programs/{id}/applicant_counts/   Get applicant counts for a program    AllowAny                    id (Program ID)               {"applied":10,"enrolled":5,"withdrawn":2,"canceled":1,"total_active":15} None
        GET    /api/programs/{id}/questions/          Get application questions for program AllowAny                    id (Program ID)               List of questions                                 None
        '''

        total_tests = [0]
        passed_tests = [0]
        failed_tests = [0]
        warnings = [0]

        # Create an admin user and a normal user
        admin = User.objects.create_user(username="admin_user", password="adminpass", email="admin@test.com", is_admin=True)
        student = User.objects.create_user(username="student_user", password="studentpass", email="student@test.com")
        another_student = User.objects.create_user(username="another_student", password="studentpass", email="another@test.com")

        ### Test Invalid Program Inputs ###

        # Authenticate as admin
        client.force_authenticate(user=admin)

        # Application deadline before open date
        bad_program_data = {
            "title": "Bad Program 1",
            "year": "2025", "semester": "Fall",
            "description": "Invalid test case.",
            "faculty_leads": "Test Faculty",
            "application_open_date": now().date(),
            "application_deadline": now().date() - timedelta(days=1),  # Invalid: Deadline before open date
            "start_date": now().date(),
            "end_date": now().date() + timedelta(days=10),
        }
        response = client.post("/api/programs/", bad_program_data)
        Command.check_response(response, 400, success_message="Rejected program with application deadline before open date.",
                            error_message="Program creation should have failed due to invalid application dates.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # End date before start date
        bad_program_data["application_deadline"] = now().date() + timedelta(days=10)  # Fix previous issue
        bad_program_data["start_date"] = now().date() + timedelta(days=5)
        bad_program_data["end_date"] = now().date()  # Invalid: End date before start date
        response = client.post("/api/programs/", bad_program_data)
        Command.check_response(response, 400, success_message="Rejected program with end date before start date.",
                            error_message="Program creation should have failed due to invalid start/end dates.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Invalid date format
        bad_program_data["start_date"] = "invalid-date"  # Invalid date format
        bad_program_data["end_date"] = now().date() + timedelta(days=10)
        response = client.post("/api/programs/", bad_program_data)
        Command.check_response(response, 400, success_message="Rejected program with invalid date format.",
                            error_message="Program creation should have failed due to invalid date format.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        ### Valid Program Creation ###

        # Successfully create a valid program
        valid_program_data = {
            "title": "Valid Program",
            "year": "2025", "semester": "Fall",
            "description": "A valid test program.",
            "faculty_leads": "Test Faculty",
            "application_open_date": now().date(),
            "application_deadline": now().date() + timedelta(days=10),
            "start_date": now().date() + timedelta(days=20),
            "end_date": now().date() + timedelta(days=30),
        }
        response = client.post("/api/programs/", valid_program_data)
        Command.check_response(response, 201, success_message="Program created successfully by admin.",
                            error_message="Program creation failed for admin.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        program_id = response.data["id"]

        # Retrieve the created program
        response = client.get(f"/api/programs/{program_id}/")
        Command.check_response(response, 200, success_message="Retrieved program details successfully.",
                            error_message="Failed to retrieve program details.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Attempt to update program as an admin
        response = client.patch(f"/api/programs/{program_id}/", {"description": "Updated description"})
        Command.check_response(response, 200, success_message="Program updated successfully by admin.",
                            error_message="Program update failed for admin.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Retrieve applicant counts (open to all)
        response = client.get(f"/api/programs/{program_id}/applicant_counts/")
        Command.check_response(response, 200, success_message="Fetched applicant counts successfully.",
                            error_message="Fetching applicant counts failed.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Retrieve program questions (open to all)
        response = client.get(f"/api/programs/{program_id}/questions/")
        Command.check_response(response, 200, success_message="Fetched application questions successfully.",
                            error_message="Fetching application questions failed.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Attempt to delete program as a student (unauthorized)
        client.force_authenticate(user=student)
        response = client.delete(f"/api/programs/{program_id}/")
        Command.check_response(response, 403, success_message="Program deletion failed as expected for unauthorized user.",
                            error_message="Program deletion should have failed for unauthorized user.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Authenticate as admin and delete the program
        client.force_authenticate(user=admin)
        response = client.delete(f"/api/programs/{program_id}/")
        Command.check_response(response, 204, success_message="Program deleted successfully by admin.",
                            error_message="Program deletion failed for admin.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Attempt to retrieve deleted program
        response = client.get(f"/api/programs/{program_id}/")
        Command.check_response(response, 404, success_message="Retrieving deleted program failed as expected.",
                            error_message="Retrieving deleted program should have failed.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Summary Report
        print("\n================ PROGRAM TEST SUMMARY ================")
        print(f"Total Tests: {total_tests[0]}")
        print(f"Passed: {passed_tests[0]}")
        print(f"Failed: {failed_tests[0]}")
        print(f"Warnings: {warnings[0]}")
        print("======================================================")

        return total_tests[0], passed_tests[0], failed_tests[0], warnings[0]

    def test_application_endpoints(self, client):
        '''
        API Endpoints:
        Method Endpoint                               Description                            Permission Classes         Arguments                      Expected Response                                    Errors
        GET    /api/applications/                     List applications                     IsAuthenticated, IsOwnerOrAdmin student=<id>, program=<id> (optional) List of applications                            None
        POST   /api/applications/                     Submit new application                IsAuthenticated            Application fields             Created application details                        403 if unauthorized
        GET    /api/applications/{id}/                Retrieve specific application         IsAuthenticated, IsOwnerOrAdmin id (Application ID)          Application details                              403 if unauthorized, 404 if not found
        PATCH  /api/applications/{id}/                Update application status             IsAuthenticated, IsOwnerOrAdmin status="Enrolled"/"Canceled" Updated application details                        403 if unauthorized, 404 if not found
        POST   /api/applications/create_or_edit/      Create or update user's application   IsAuthenticated            program=<id>, date_of_birth, gpa, major {"message":"Application created","id":<id>} None
        '''

        total_tests = [0]
        passed_tests = [0]
        failed_tests = [0]
        warnings = [0]

        admin = User.objects.get(username="admin_user")
        student = User.objects.get(username="student_user")

        program = Program.objects.create(
            title="Test Program",
            "year": "2025", "semester": "Fall",
            description="A program for testing applications.",
            application_open_date=now().date(),
            application_deadline=now().date() + timedelta(days=10),
            start_date=now().date() + timedelta(days=20),
            end_date=now().date() + timedelta(days=30),
        )
        program.faculty_leads.add(admin)

        client.force_authenticate(user=student)
        response = client.post("/api/applications/", {
            "program": program.id,
            "date_of_birth": "2000-01-01",
            "gpa": 3.8,
            "major": "Computer Science",
            "status": "Applied",
        })
        Command.check_response(response, 201, success_message="Application submitted successfully.",
                            error_message="Application submission failed.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        application_id = response.data["id"]

        # Student attempts to enroll themselves (should be denied)
        response = client.patch(f"/api/applications/{application_id}/", {"status": "Enrolled"})
        Command.check_response(response, 403, success_message="Student was correctly prevented from enrolling themselves.",
                            error_message="Student should not be able to enroll themselves.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Student withdraws their application
        response = client.patch(f"/api/applications/{application_id}/", {"status": "Withdrawn"})
        Command.check_response(response, 200, success_message="Student successfully withdrew application.",
                            error_message="Student failed to withdraw application.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Student reapplies after withdrawing
        response = client.patch(f"/api/applications/{application_id}/", {"status": "Applied"})
        Command.check_response(response, 200, success_message="Student successfully reapplied after withdrawal.",
                            error_message="Student failed to reapply after withdrawal.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Admin enrolls student
        client.force_authenticate(user=admin)
        response = client.patch(f"/api/applications/{application_id}/", {"status": "Enrolled"})
        Command.check_response(response, 200, success_message="Admin successfully enrolled student.",
                            error_message="Admin failed to enroll student.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Admin cancels application
        response = client.patch(f"/api/applications/{application_id}/", {"status": "Canceled"})
        Command.check_response(response, 200, success_message="Admin successfully canceled application.",
                            error_message="Admin failed to cancel application.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Validate date of birth must be at least 10 years ago
        invalid_dob = (now().date() - timedelta(days=9 * 365)).strftime("%Y-%m-%d")  # 9 years old
        response = client.post("/api/applications/", {
            "student": student.id,
            "program": program.id,
            "date_of_birth": invalid_dob,
            "gpa": 3.8,
            "major": "Computer Science",
            "status": "Applied",
        })
        Command.check_response(response, 400, success_message="Application failed as expected due to invalid date of birth (too young).",
                            error_message="Application should have failed due to applicant being under 10 years old.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Validate correct date of birth (10+ years old)
        valid_dob = (now().date() - timedelta(days=10 * 365)).strftime("%Y-%m-%d")  # Exactly 10 years old
        response = client.post("/api/applications/", {
            "student": student.id,
            "program": program.id,
            "date_of_birth": valid_dob,
            "gpa": 3.8,
            "major": "Computer Science",
            "status": "Applied",
        })
        Command.check_response(response, 201, success_message="Application succeeded with valid date of birth (10+ years old).",
                            error_message="Application failed despite valid date of birth.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Delete the application as an admin
        response = client.delete(f"/api/applications/{application_id}/")
        Command.check_response(response, 204, success_message="Application deleted successfully by admin.",
                            error_message="Application deletion failed for admin.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Attempt to retrieve deleted application
        response = client.get(f"/api/applications/{application_id}/")
        Command.check_response(response, 404, success_message="Retrieving deleted application failed as expected.",
                            error_message="Retrieving deleted application should have failed.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Summary Report
        print("\n============== APPLICATION TEST SUMMARY ==============")
        print(f"Total Tests: {total_tests[0]}")
        print(f"Passed: {passed_tests[0]}")
        print(f"Failed: {failed_tests[0]}")
        print(f"Warnings: {warnings[0]}")
        print("======================================================")

        return total_tests[0], passed_tests[0], failed_tests[0], warnings[0]




    def test_question_endpoints(self, client):
        '''
        API Endpoints:
        Method Endpoint                         Description                    Permission Classes Arguments                 Expected Response Errors
        GET    /api/questions/                  List all application questions AllowAny          program=<id> (optional) List of questions None
        GET    /api/questions/{id}/              Retrieve specific question     AllowAny          id (Question ID)       Question details 404 if not found
        '''

        total_tests = [0]
        passed_tests = [0]
        failed_tests = [0]
        warnings = [0]

        admin = User.objects.get(username="admin_user")
        student = User.objects.get(username="student_user")

        client.force_authenticate(user=admin)
        program_data = {
            "title": "Test Program for Questions",
            "year": "2025", "semester": "Fall",
            "description": "A program for testing questions.",
            "faculty_leads": [admin.id],
            "application_open_date": now().date(),
            "application_deadline": now().date() + timedelta(days=10),
            "start_date": now().date() + timedelta(days=20),
            "end_date": now().date() + timedelta(days=30),
        }
        
        response = client.post("/api/programs/", program_data)
        Command.check_response(response, 201, success_message="Program created successfully (questions should be auto-generated).",
                            error_message="Failed to create program and auto-generate questions.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        program_id = response.data["id"]

        # Fetch all questions (anonymous user)
        client.force_authenticate(user=None)
        response = client.get(f"/api/programs/{program_id}/questions/")
        Command.check_response(response, 200, success_message="Retrieved questions successfully as an anonymous user.",
                            error_message="Failed to retrieve questions as an anonymous user.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Ensure questions exist
        assert len(response.data) > 0, "No questions were automatically generated when the program was created."
        
        question_id = response.data[0]["id"]  # Take the first question

        # Retrieve specific question
        response = client.get(f"/api/questions/{question_id}/")
        Command.check_response(response, 200, success_message="Successfully retrieved a specific question.",
                            error_message="Failed to retrieve a specific question.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Unauthorized attempts to create, edit, or delete questions

        # Student tries to create a question (should fail)
        client.force_authenticate(user=student)
        response = client.post("/api/questions/", {
            "program": program_id,
            "text": "Unauthorized question attempt",
        })
        Command.check_response(response, 405, success_message="Unauthorized user was prevented from creating a question.",
                            error_message="Unauthorized user should not be able to create a question.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Admin tries to create a question manually (should fail)
        client.force_authenticate(user=admin)
        response = client.post("/api/questions/", {
            "program": program_id,
            "text": "Manually added question",
        })
        Command.check_response(response, 405, success_message="Admin was prevented from manually creating a question.",
                            error_message="Admin should not be able to manually create a question.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Admin tries to delete a question (should fail)
        response = client.delete(f"/api/questions/{question_id}/")
        Command.check_response(response, 405, success_message="Admin was prevented from deleting a question.",
                            error_message="Admin should not be able to delete a question.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Summary Report
        print("\n==================== QUESTION TEST SUMMARY ====================")
        print(f"Total Tests: {total_tests[0]}")
        print(f"Passed: {passed_tests[0]}")
        print(f"Failed: {failed_tests[0]}")
        print(f"Warnings: {warnings[0]}")
        print("===============================================================")

        return total_tests[0], passed_tests[0], failed_tests[0], warnings[0]



    def test_response_endpoints(self, client):
        '''
        API Endpoints:
        Method Endpoint                        Description                     Permission Classes                    Arguments                       Expected Response                           Errors
        GET    /api/responses/                 List application responses      IsAuthenticated, IsApplicationResponseOwnerOrAdmin question=<id>, application=<id> (optional) List of responses  None
        POST   /api/responses/                 Submit response to question     IsAuthenticated                    application=<id>, question_id=<id>, response_text=<string> {"message":"Response created","id":<id>} 403 if unauthorized
        PATCH  /api/responses/{id}/            Update an existing response     IsAuthenticated, IsApplicationResponseOwnerOrAdmin response_text=<string> {"message":"Response updated","id":<id>} 403 if unauthorized, 404 if not found
        DELETE /api/responses/{id}/            Delete a response               IsAuthenticated, IsApplicationResponseOwnerOrAdmin id (Response ID) 204 No Content 403 if unauthorized, 404 if not found
        '''

        total_tests = [0]
        passed_tests = [0]
        failed_tests = [0]
        warnings = [0]

        admin = User.objects.get(username="admin_user")
        student = User.objects.get(username="student_user")
        other_student = User.objects.get(username="another_student")

        client.force_authenticate(user=admin)
        program_data = {
            "title": "Response Test Program",
            "year": "2025", "semester": "Fall",
            "description": "A program for testing application responses.",
            "faculty_leads": "Test Faculty",
            "application_open_date": now().date(),
            "application_deadline": now().date() + timedelta(days=10),
            "start_date": now().date() + timedelta(days=20),
            "end_date": now().date() + timedelta(days=30),
        }
        
        response = client.post("/api/programs/", program_data)
        Command.check_response(response, 201, success_message="Program created successfully (questions should be auto-generated).",
                            error_message="Failed to create program and auto-generate questions.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        program_id = response.data["id"]

        # Fetch program questions (auto-generated)
        client.force_authenticate(user=None)  # Anonymous user
        response = client.get(f"/api/programs/{program_id}/questions/")
        Command.check_response(response, 200, success_message="Retrieved questions successfully.",
                            error_message="Failed to retrieve questions.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        assert len(response.data) > 0, "No questions were automatically generated when the program was created."
        question_id = response.data[0]["id"]

        # Student submits an application for the program
        client.force_authenticate(user=student)
        application_data = {
            "program": program_id,
            "date_of_birth": "2000-01-01",
            "gpa": 3.8,
            "major": "Computer Science"
        }
        response = client.post("/api/applications/", application_data)
        Command.check_response(response, 201, success_message="Application submitted successfully.",
                            error_message="Failed to submit application.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        application_id = response.data["id"]

        # Student submits a response to a question
        response_data = {
            "application": application_id,
            "question": question_id,
            "response": "I want to gain global experience."
        }
        response = client.post("/api/responses/", response_data)
        Command.check_response(response, 201, success_message="Successfully submitted an application response.",
                            error_message="Failed to submit an application response.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        response_id = response.data["id"]

        # Student retrieves their own responses
        response = client.get(f"/api/responses/?application={application_id}")
        Command.check_response(response, 200, success_message="Successfully retrieved own application responses.",
                            error_message="Failed to retrieve own application responses.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Unauthorized student (other_student) tries to view another student's response (should fail)
        client.force_authenticate(user=other_student)
        response = client.get(f"/api/responses/?application={application_id}")
        print("Response:", response.status_code, response.data)
        Command.check_response(response, 403, success_message="Unauthorized student was prevented from accessing another student's responses.",
                            error_message="Unauthorized student should not have access to another student's responses.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Student updates their response
        client.force_authenticate(user=student)
        response = client.patch(f"/api/responses/{response_id}/", {"response": "I want to broaden my knowledge."})
        Command.check_response(response, 200, success_message="Successfully updated application response.",
                            error_message="Failed to update application response.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Admin tries to update a student's response (should fail)
        client.force_authenticate(user=admin)
        response = client.patch(f"/api/responses/{response_id}/", {"response": "Admin should not edit this."})
        Command.check_response(response, 403, success_message="Admin was prevented from modifying a student's response.",
                            error_message="Admin should not be able to modify a student's response.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Student tried to delete their own response (should fail)
        client.force_authenticate(user=student)
        response = client.delete(f"/api/responses/{response_id}/")
        Command.check_response(response, 403, success_message="Student was prevented from deleting application response.",
                            error_message="Deleting an application response should have failed.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Student attempts to delete a response that no longer exists (should fail)
        response = client.delete(f"/api/responses/{response_id}/")
        Command.check_response(response, 403, success_message="Deleting a non-existent response failed as expected.",
                            error_message="Deleting a non-existent response should have failed.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Unauthorized student (other_student) tries to delete a response from another student (should fail)
        client.force_authenticate(user=other_student)
        response = client.delete(f"/api/responses/{response_id}/")
        Command.check_response(response, 403, success_message="Unauthorized student was prevented from deleting another student's response.",
                            error_message="Unauthorized student should not be able to delete another student's response.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Summary Report
        print("\n==================== RESPONSE TEST SUMMARY ====================")
        print(f"Total Tests: {total_tests[0]}")
        print(f"Passed: {passed_tests[0]}")
        print(f"Failed: {failed_tests[0]}")
        print(f"Warnings: {warnings[0]}")
        print("===============================================================")

        return total_tests[0], passed_tests[0], failed_tests[0], warnings[0]


    def test_announcement_endpoints(self, client):
        '''
        API Endpoints:
        Method Endpoint                         Description                     Permission Classes Arguments                 Expected Response Errors
        GET    /api/announcements/              List all active announcements   AllowAny          None                     List of announcements None
        POST   /api/announcements/              Create new announcement         IsAuthenticated, IsAdmin Announcement fields (JSON) Created announcement details 403 if unauthorized
        GET    /api/announcements/{id}/         Retrieve specific announcement  AllowAny          id (Announcement ID)    Announcement details 404 if not found
        PATCH  /api/announcements/{id}/         Update an announcement         IsAuthenticated, IsAdmin Announcement fields Updated announcement details 403 if unauthorized, 404 if not found
        DELETE /api/announcements/{id}/         Delete an announcement         IsAuthenticated, IsAdmin id (Announcement ID) 204 No Content 403 if unauthorized, 404 if not found
        '''

        total_tests = [0]
        passed_tests = [0]
        failed_tests = [0]
        warnings = [0]

        admin = User.objects.get(username="admin_user")
        student = User.objects.get(username="student_user")

        # Fetch all announcements (unauthenticated)
        client.force_authenticate(user=None)
        response = client.get("/api/announcements/")
        Command.check_response(response, 200, success_message="Successfully retrieved announcements as an unauthenticated user.",
                            error_message="Failed to retrieve announcements as an unauthenticated user.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Fetch all announcements (authenticated)
        client.force_authenticate(user=student)
        response = client.get("/api/announcements/")
        Command.check_response(response, 200, success_message="Successfully retrieved announcements as an authenticated user.",
                            error_message="Failed to retrieve announcements as an authenticated user.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Create a new announcement (admin only)
        client.force_authenticate(user=admin)
        announcement_data = {
            "title": "Test Announcement",
            "content": {"text": "This is a test announcement."},  # Ensure valid JSON
            "importance": "medium",
            "is_active": True
        }
        response = client.post("/api/announcements/", announcement_data, format='json')
        Command.check_response(response, 201, success_message="Admin successfully created an announcement.",
                            error_message="Admin failed to create an announcement.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)
        announcement_id = response.data["id"]

        # Retrieve a specific announcement
        client.force_authenticate(user=None)
        response = client.get(f"/api/announcements/{announcement_id}/")
        Command.check_response(response, 200, success_message="Successfully retrieved a specific announcement.",
                            error_message="Failed to retrieve a specific announcement.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Update an announcement (admin only)
        client.force_authenticate(user=admin)
        updated_data = {"title": "Updated Announcement Title"}
        response = client.patch(f"/api/announcements/{announcement_id}/", updated_data)
        Command.check_response(response, 200, success_message="Admin successfully updated an announcement.",
                            error_message="Admin failed to update an announcement.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Unauthorized user attempts to update an announcement (should fail)
        client.force_authenticate(user=student)
        response = client.patch(f"/api/announcements/{announcement_id}/", updated_data)
        Command.check_response(response, 403, success_message="Unauthorized user was prevented from updating an announcement.",
                            error_message="Unauthorized user should not be able to update an announcement.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Delete an announcement (admin only)
        client.force_authenticate(user=admin)
        response = client.delete(f"/api/announcements/{announcement_id}/")
        Command.check_response(response, 204, success_message="Admin successfully deleted an announcement.",
                            error_message="Admin failed to delete an announcement.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Attempt to retrieve a deleted announcement (should fail)
        client.force_authenticate(user=None)
        response = client.get(f"/api/announcements/{announcement_id}/")
        Command.check_response(response, 404, success_message="Fetching a deleted announcement failed as expected.",
                            error_message="Fetching a deleted announcement should have failed.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Unauthorized user attempts to delete an announcement (should fail)
        client.force_authenticate(user=student)
        response = client.delete(f"/api/announcements/{announcement_id}/")
        Command.check_response(response, 403, success_message="Unauthorized user was prevented from deleting an announcement.",
                            error_message="Unauthorized user should not be able to delete an announcement.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Summary Report
        print("\n==================== ANNOUNCEMENT TEST SUMMARY ====================")
        print(f"Total Tests: {total_tests[0]}")
        print(f"Passed: {passed_tests[0]}")
        print(f"Failed: {failed_tests[0]}")
        print(f"Warnings: {warnings[0]}")
        print("===================================================================")

        return total_tests[0], passed_tests[0], failed_tests[0], warnings[0]
    
    def test_notes_endpoints(self, client):
        '''
        API Endpoints:
        Method Endpoint                         Description                     Permission Classes Arguments                 Expected Response            Errors
        GET    /api/notes/                      List all confidential notes     Admin Only         None                      List of confidential notes   403 if unauthorized
        GET    /api/notes/?application=<id>     Filter notes by application     Admin Only         Application ID            Created announcement details 403 if unauthorized
        POST   /api/notes/                      Create new note                 Admin Only         Application ID, Content   Created Note Details         403 if unauthorized
        '''

        total_tests = [0]
        passed_tests = [0]
        failed_tests = [0]
        warnings = [0]

        admin = User.objects.get(username="admin_user")
        student = User.objects.get(username="student_user")

        # Create a test application
        client.force_authenticate(user=student)
        application_data = {
            "program": 1,
            "date_of_birth": "2000-01-01",
            "gpa": 3.8,
            "major": "Computer Science"
        }
        response = client.post("/api/applications/", application_data)
        Command.check_response(response, 201, success_message="Application submitted successfully.",
                            error_message="Failed to submit application.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        application_id = response.data["id"]

        # Attempt to fetch all notes as an unauthenticated user (should fail)
        client.force_authenticate(user=None)
        response = client.get("/api/notes/")
        Command.check_response(response, 401, success_message="Unauthenticated user was correctly denied access to confidential notes.",
                            error_message="Unauthenticated user should not be able to access confidential notes.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Attempt to fetch all notes as a student (should fail)
        client.force_authenticate(user=student)
        response = client.get("/api/notes/")
        Command.check_response(response, 403, success_message="Student was correctly denied access to confidential notes.",
                            error_message="Student should not be able to access confidential notes.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Fetch all notes as an admin (should succeed)
        client.force_authenticate(user=admin)
        response = client.get("/api/notes/")
        Command.check_response(response, 200, success_message="Admin successfully retrieved all confidential notes.",
                            error_message="Admin failed to retrieve confidential notes.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Fetch notes for a specific application as a student (should fail)
        client.force_authenticate(user=student)
        response = client.get(f"/api/notes/?application={application_id}")
        Command.check_response(response, 403, success_message="Student was correctly denied access to application notes.",
                            error_message="Student should not be able to access application notes.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Fetch notes for a specific application as an admin (should succeed)
        client.force_authenticate(user=admin)
        response = client.get(f"/api/notes/?application={application_id}")
        Command.check_response(response, 200, success_message="Admin successfully retrieved notes for application.",
                            error_message="Admin failed to retrieve notes for application.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Attempt to create a note as a student (should fail)
        client.force_authenticate(user=student)
        note_data = {"application": application_id, "content": "This is a confidential note."}
        response = client.post("/api/notes/", note_data)
        Command.check_response(response, 403, success_message="Student was correctly denied access to create a confidential note.",
                            error_message="Student should not be able to create a confidential note.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Create a note as an admin (should succeed)
        client.force_authenticate(user=admin)
        response = client.post("/api/notes/", note_data)
        Command.check_response(response, 201, success_message="Admin successfully created a confidential note.",
                            error_message="Admin failed to create a confidential note.",
                            total_tests=total_tests, passed_tests=passed_tests, failed_tests=failed_tests, warnings=warnings)

        # Verify the created note is associated with the correct application
        note_id = response.data["id"]
        response = client.get(f"/api/notes/?application={application_id}")
        assert any(note["id"] == note_id for note in response.data), "Created note is not associated with the correct application."


        # Summary Report
        print("\n======================= NOTES TEST SUMMARY ========================")
        print(f"Total Tests: {total_tests[0]}")
        print(f"Passed: {passed_tests[0]}")
        print(f"Failed: {failed_tests[0]}")
        print(f"Warnings: {warnings[0]}")
        print("===================================================================")

        return total_tests[0], passed_tests[0], failed_tests[0], warnings[0]



