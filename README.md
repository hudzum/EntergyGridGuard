## How to set up project

Hello team, I just wanted to give a brief rundown on how to setup the project for those who are new to using docker.

1. Make sure you have the docker application installed
2. Sign up / Sign in to Docker
3. Clone the Github Repo to your local workspace
4. CD into the root of the project folder
5. Run "docker-compose up --build" (Builds and runs all our containers/services i.e. frontend, backend, database)
6. It may take a few minutes to start up, but afterwards you should be able to see all the containers running individually (on the docker app).
7. Everytime you make a change or want to stop running you will need to run docker-compose down to stop close all the containers.
8. Note: (You can of course develop within your own local compartments without running every container)
