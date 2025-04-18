import re
import requests
from bs4 import BeautifulSoup

ULINK_BASE_URL = "http://ulink.colab.duke.edu:8000"
ULINK_PIN_ENDPOINT = "/cgi-bin/view-pin.pl"
ULINK_AUTH = ("abroad", "ece@458")

COURSE_CODE_REGEX = re.compile(r"^[A-Z0-9]{1,8} \d{3}$")
PASSING_GRADES = {"A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "S", "IP"}


def get_ulink_pin(username):
    """
    Retrieve the PIN for a Ulink username via screen scraping.
    """
    params = {"username": username}
    response = requests.get(
        f"{ULINK_BASE_URL}{ULINK_PIN_ENDPOINT}",
        params=params,
        auth=ULINK_AUTH
    )

    if response.status_code != 200:
        raise ConnectionError(f"Ulink request failed with status {response.status_code}")

    soup = BeautifulSoup(response.text, "html.parser")

    target_text = f"PIN for '{username}':"
    for tag in soup.find_all("b"):
        if tag.previous_sibling and target_text in tag.previous_sibling:
            return tag.text.strip()

    raise ValueError("PIN not found in Ulink response")

def refresh_ulink_transcript(ulink_username):
    """
    Retrieves and parses the user's course history from Ulink.
    Returns a dict mapping course codes to grades.
    """
    params = {"username": ulink_username}
    response = requests.get(
        f"{ULINK_BASE_URL}/cgi-bin/view-schedule.pl",
        params=params,
        auth=ULINK_AUTH
    )

    if response.status_code != 200:
        raise ConnectionError(f"Ulink transcript request failed with status {response.status_code}")

    soup = BeautifulSoup(response.text, "html.parser")
    pre = soup.find("pre")
    if not pre:
        raise ValueError("Transcript section not found in Ulink HTML")

    lines = pre.get_text().splitlines()
    transcript = {}

    for line in lines:
        stripped = line.strip()
        if not stripped or stripped.startswith("siss%") or stripped.startswith("SISS Record") or stripped.startswith("*") or stripped.startswith("-"):
            continue

        # Example: "BIOL 101             GENERAL BIOLOGY                IP"
        parts = stripped.split()
        
        course_code = f"{parts[0]} {parts[1]}"
        grade = parts[-1]
        
        if not COURSE_CODE_REGEX.match(course_code):
            raise ValueError(f"Invalid course code format: '{course_code}'")

        if grade not in PASSING_GRADES:
            raise ValueError(f"Invalid or unrecognized grade '{grade}' for course '{course_code}'")

        transcript[course_code] = grade

    return transcript

