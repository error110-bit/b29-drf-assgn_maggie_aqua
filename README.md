# Creative Workflow Tracker

A full-stack project management and collaboration platform built using **Django REST Framework** and **React**. The application helps creative teams manage studios, projects, tasks, discussions, attachments, notifications, and workflow stages efficiently.

---

## Features

### Authentication

* User Registration
* User Login using JWT Authentication
* Protected Routes

### Studio Management

* Create Studios
* View Studios
* Manage Studio Memberships
* Data isolation

### Project Management

* Create Projects
* Assign Project Leads
* View Project Details

### Task Management

* Create Tasks
* Assign Tasks to Team Members
* Track Task Status and Deadlines

### Workflow Stages

* Create Stages

### Discussions

* Create Discussion Threads
* Add Comments

### Attachments

* Upload Attachment URLs
* Associate Attachments with Tasks

### Notifications

* Send Notifications
* View Notifications

### Role-Based Access Control (RBAC)

* Admin
* Project Lead
* Designer
* Writer
* Reviewer
* Client (Read Only)

---

## Tech Stack

### Backend

* Python
* Django
* Django REST Framework
* Simple JWT
* SQLite
* Django Filter
* Django CORS Headers

### Frontend

* React
* React Router DOM
* Axios
* Vite

---

## Project Structure

```text
drf/
├── apps/
│   ├── users/
│   ├── studios/
│   ├── projects/
│   ├── discussions/
│   ├── attachments/
|   ├── common/ 
│   └──notifications/
│    
├── manage.py
└── configuration/
|   ├── settings.py/ 
│   └── urls.py/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── main.jsx
│   ├── App.css
│   └── App.jsx
│
└── package.json
```

---

## Backend Setup

### Clone Repository

```bash
git clone <repository-url>
cd <repository-name>
```

### Create Virtual Environment

```bash
python3 -m venv venv
```

### Activate Virtual Environment

#### Linux / macOS

```bash
source venv/bin/activate
```

#### Windows

```bash
venv\Scripts\activate
```

### Install Dependencies

```bash
pip install django djangorestframework djangorestframework-simplejwt django-filter django-cors-headers
```

### Start Backend Server

```bash
python manage.py runserver
```

Backend runs on:

```text
http://127.0.0.1:8000
```

---

## Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the frontend application:

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## Link for the Demo Video
https://drive.google.com/drive/folders/1U-QjVqgcviTTp1XniIGKT0SVZfTwAA7C?usp=sharing
