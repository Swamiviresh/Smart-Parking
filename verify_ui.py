from playwright.sync_api import sync_playwright
import os

def run_verification(page):
    # 1. Login
    page.goto("http://localhost:3000")
    page.wait_for_timeout(2000)
    
    # Try to register a new user
    page.goto("http://localhost:3000/register")
    page.wait_for_timeout(1000)
    page.get_by_placeholder("Enter your full name").fill("Test User")
    page.get_by_placeholder("Enter your email").fill("test_new@example.com")
    page.get_by_placeholder("Create a password").fill("password123")
    page.get_by_role("button", name="Register").click()
    page.wait_for_timeout(2000)
    
    # After registration, it should redirect to login (/)
    page.get_by_placeholder("Enter your email").fill("test_new@example.com")
    page.get_by_placeholder("Enter your password").fill("password123")
    page.get_by_role("button", name="Sign In").click()
    page.wait_for_timeout(2000)

    # 2. Check Dashboard
    print("Checking Dashboard...")
    page.screenshot(path="/home/jules/verification/screenshots/dashboard_initial.png")
    page.wait_for_timeout(1000)
    
    # 3. Go to Profile and link RFID
    print("Checking Profile...")
    page.get_by_role("link", name="Profile").click()
    page.wait_for_timeout(1000)
    page.get_by_placeholder("Enter RFID UID").fill("TEST_RFID_123")
    page.get_by_role("button", name="Save RFID").click()
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/profile_updated.png")
    
    # 4. Return to Dashboard and Prebook
    print("Prebooking...")
    page.get_by_role("link", name="Smart Parking").click()
    page.wait_for_timeout(1000)
    
    # Find Slot 1 card and prebook
    slot1_card = page.locator("div:has-text('Slot P1')").first
    slot1_card.locator("input[type='time']").fill("14:00")
    page.wait_for_timeout(500)
    slot1_card.get_by_role("button", name="Prebook Now").click()
    page.wait_for_timeout(2000)
    
    page.screenshot(path="/home/jules/verification/screenshots/dashboard_booked.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_verification(page)
        finally:
            context.close()
            browser.close()
