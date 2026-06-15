# SubSync

SubSync is a small full stack project built to generate subtitles from audio and video files.

The idea behind the project was to create a simple workflow where a user can:

* upload a media file
* generate a transcript
* edit the transcript manually
* download subtitle files

The project uses a React frontend with a Node.js + Express backend and MongoDB for storing user/project data.
For transcription, a Python helper script using Whisper is used.

## Features

* User authentication
* Audio/video upload
* Transcript generation
* Subtitle editing
* TXT export
* SRT export
* Project history dashboard

## Tech Stack

Frontend:

* React
* React Router
* Axios

Backend:

* Node.js
* Express.js
* MongoDB
* JWT Authentication
* Multer

Transcription:

* Python
* Faster Whisper

## Why I Built This

I wanted to explore how transcription and subtitle workflows actually work behind the scenes.
Most online subtitle tools feel complicated, so the goal here was to keep the interface simple and easy to use.

## Future Improvements

Some improvements I plan to add later:

* proper timestamp-based SRT generation
* subtitle burn-in on videos
* cloud storage support
* better subtitle styling controls

## Running Locally

Frontend:

```bash
npm install
npm run dev
```

Backend:

```bash
npm install
npm run dev
```

Python dependencies:

```bash
pip install faster-whisper
```

Create a `.env` file in backend:

```env
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret
```
