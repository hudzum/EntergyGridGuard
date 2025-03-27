## How to set up project v2 
Updated to Include Getting our LLM setup


1. Make sure you have the docker application installed 
2. Sign up / Sign in to Docker (And make sure it is running on your desktop)
3. Clone the Github Repo to your local workspace

SSHing into your GIZMO machine
(if you've already followed the setup provided by Kyle skip to step )

Download the Folder sent by Kyle on Teams
Create a folder named ".ssh" inside your home directory if it doesn't already exist.
Your home directory is usually `/home/{username}` on Mac/Linux, and `C:\Users\{username}` on Windows.
(You will likely be prompted that you can't use . at the start of a folder, so you will need to use terminal commands)
`mkdir -p ~/.ssh` (Creates directory)
`cd ~/.ssh` (Move into .ssh directory)
`mv ~/Downloads/GIZMO_SSH_KEY_hudson_vu ~/.ssh/` (Moves SSH key file into .ssh directory)
`chmod 600 ~/.ssh/GIZMO_SSH_KEY_hudson_vu` (Ensure Permission to read and use key)

Now you can connect to the ssh using `ssh -i ~/.ssh/GIZMO_SSH_KEY_[user_name] -p 34130 [user_name]@[HostName]`
If you see green text and a new terminal, then you have connected to the GIZMO machine.

now you will run our qwen model found in the Shared Entergy Folder
(base) user_name@gizmo:~$ 
`cd ../..`
`cd shared_folders/entergy/qwen_7B/` (directory containing our LLM server)
`python run_qwen.py` (Errors will appear you will need to pip install the different libraries [This is scuffed rn a fix is in the work ])

Eventually You should see a "Server Started Prompt" like "Uvicorn running on http://0.0.0.0:5353"

Congrats you now have a qwen model up and running

4. Add the .env (found in teams) to the root of the project 
You will need to open it and modify the SSH_USERNAME and SSH_KEY_PATH

SSH_USERNAME=user_name
SSH_KEY_PATH=/app/.ssh/GIZMO_SSH_KEY_user_name 
(this is the path of your public key while running inside the docker container)

Go to your Docker Desktop 
Click the settings icon in the Top Right
Resources -> File sharing
(Here we are going to share our public key file with docker)
Add the path to your .ssh folder Example: (Users/username/.ssh/)

Finally to mount the volume, open docker-compose.yml (root of our project)
backend:
    volumes
        - ~/.ssh/GIZMO_SSH_KEY_[user_name]:/app/.ssh/GIZMO_SSH_KEY_user_name:ro
(This sets your local public key file to a docker container path)




Next you will need to go into your docker
4. CD into the root of the project folder

Add the .env (found in teams) to the root of the project 
5. Run "docker-compose up --build" (Builds and runs all our containers/services i.e. frontend, backend, database)
6. It may take a few minutes to start up, but afterwards you should be able to see all the containers running individually (on the docker app).
7. Everytime you make a change or want to stop running you will need to run docker-compose down to stop close all the containers.
8. Note: (You can of course develop within your own local compartments without running every container)
