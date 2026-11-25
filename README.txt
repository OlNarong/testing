NARONG OL PORTFOLIO — GITHUB PAGES FIX

WHAT CHANGED
- Public index.html now loads projects from ./projects.json.
- Admin export now downloads a portable projects.json file.
- Browser-only media IDs are excluded from the exported JSON.

IMPORTANT LIMITATION
GitHub Pages is static hosting. It cannot receive writes from admin.html.
localStorage and IndexedDB are private to one browser and are not shared with
website visitors. This update provides a static publishing workflow; it does
not create a shared online database.

HOW TO PUBLISH A PROJECT
1. Put image files in the repository's images/ folder.
2. Put video files in the repository's videos/ folder (large videos are better
   hosted on a video/CDN service).
3. In Admin, set Media file path to a relative path, for example:
      images/project-name.jpg
      videos/project-name.mp4
   Do not use Windows paths such as F:\folder\photo.jpg.
4. Click Save project.
5. Click Export project data. This downloads projects.json.
6. Replace the repository's projects.json with the downloaded file.
7. Commit and push the media files and projects.json to GitHub.
8. Wait for GitHub Pages to redeploy, then refresh the public website.

NOTE ABOUT EXISTING PROJECTS
Projects currently saved only in this browser's localStorage are not included
in this ZIP. Open the Admin page in the same browser where they were created,
then export projects.json. For uploaded media stored in browser IndexedDB,
you must also add the original media files to the GitHub repository (or use
external hosted URLs) and update each project's media path.

For public video links, use a direct video file URL or a supported hosted
video embed. Keep GitHub repository media reasonably small; GitHub Pages is
not intended for hosting a 520 MB media library.
