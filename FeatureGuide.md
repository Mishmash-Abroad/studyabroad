## (Extra Credit) GUI-Editable Home Page Feature Guide

**Overview**  
As an optional extra credit feature, the system provides a graphical editor for posting and managing announcements on the site. Administrators can create and edit announcements with rich text (headings, bold, lists, images, tables, etc.) while ensuring safety (no raw HTML). These announcements are then displayed to students on the homepage/dashboard through a user-friendly viewer. This satisfies the “GUI-editable homepage” extra credit requirement.

---

## 1. Design & Architecture

1. **Data Storage**  
   - Announcements are stored in the `Announcement` model, which uses a `JSONField` to store rich-text data. This avoids storing raw HTML directly, enhancing security.
   - Each announcement has fields like:
     - `title` (short descriptor of the announcement),
     - `content` (JSON-based rich text),
     - `importance` (low/medium/high/urgent),
     - `is_active` (whether it’s currently displayed).

2. **Admin Management**  
   - The **AnnouncementsManager** component provides a dashboard interface for administrators.  
     - A table lists existing announcements, showing title, creation date, importance level, and active status.  
     - Admins can create, edit, or delete announcements.

3. **WYSIWYG Editor**  
   - The **AnnouncementEditor** component uses [Tiptap](https://tiptap.dev/), which provides a full-featured rich text editor in React.  
   - Admins can apply formatting (bold, italic), insert links, images, tables, and even switch to Markdown mode.  
   - Content is then automatically converted into a structured JSON representation before being stored in the database.

4. **Viewing Announcements**  
   - The **AnnouncementsViewer** component displays announcements to non-admin users (or admin in a “view” capacity).  
   - Users can page through multiple announcements, expand/collapse lengthy announcements, and see visuals like “Importance” badges.

---

## 2. Benefits & Value

1. **Rich Text Without Raw HTML**  
   - The system avoids raw HTML storage. Instead, Tiptap’s schema and a JSON-based field ensure safe and consistent formatting.

2. **Live Updates**  
   - Announcements can be created or edited by admin users at any time. Students see the updated content immediately on their homepage/dashboard.

3. **Enhanced Communication**  
   - With support for headings, bullet/numbered lists, images, and hyperlinks, administrators can create visually appealing notices that effectively grab students’ attention.

4. **Security & Safety**  
   - Since no raw HTML is submitted, the risk of accidental (or malicious) injection is greatly reduced.

---

## 3. Walkthrough: How To Use

### 3.1. Creating a New Announcement (Administrator)

1. **Go to the Admin Dashboard**  
   - Once logged in as an admin, navigate to the “Admin Dashboard” and select **Manage Announcements**.

2. **Open the Announcements Manager**  
   - You will see a table of existing announcements (if any), plus a **New Announcement** button on the top-right.

3. **Click “New Announcement”**  
   - A dialog opens, showing the **AnnouncementEditor**.

4. **Enter Title and Importance**  
   - Provide an announcement title (e.g., “Welcome Back!”).  
   - Choose an importance level (low, medium, high, or urgent) from the dropdown.

5. **Compose Content in the Rich Text Editor**  
   - Type or paste your announcement text.  
   - Use toolbar buttons for bold, italic, bullet or numbered lists, etc.  
   - Insert images by providing an image URL.  
   - Insert tables or code blocks if needed.

6. **(Optional) Use Markdown Mode**  
   - Toggle the **“Markdown”** button if you prefer writing in Markdown.  
   - Once finished, click **“Render Markdown”** to convert back to the rich-text format for final review.

7. **Click “Post Announcement”**  
   - The system saves the announcement, including all styled content, into the database as JSON.  
   - The dialog closes and the new announcement appears in the table.

### 3.2. Editing an Existing Announcement

1. **Locate the Announcement** in the table.  
2. Click the **Edit** icon (pencil).  
3. The same editor dialog appears with the current title and content prefilled.  
4. Make changes and click **Update Announcement** to save.

### 3.3. Deleting an Announcement

1. **Locate the Announcement** in the table.  
2. Click the **Delete** icon (trash can).  
3. A confirmation dialog appears; click **Delete** to confirm.

### 3.4. Viewing Announcements (Students, Admins, & Guests)

1. **Announcements Viewer**  
   - On the student dashboard or homepage, announcements are displayed via the **AnnouncementViewer**.  
   - You can scroll through each announcement by clicking arrows on either side.  
   - If an announcement is long, you can click **“Show More”** to expand its contents.

2. **Badge & Paging**  
   - An **“Importance”** badge (Urgent, High, Medium, Low) is visible at the top of each announcement.  
   - You can page through multiple announcements if more than one is active.