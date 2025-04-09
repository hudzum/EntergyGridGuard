# import paramiko
# import time
# import os
# import sys
# import base64
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

# SSH_HOST = "45.21.85.155"
# SSH_PORT = 34130
# Define environmental variables for your own GIZMO username and ssh key path.
# SSH_USERNAME = os.getenv("SSH_USERNAME")
# SSH_KEY = os.getenv("SSH_KEY")

import io

# ssh_pkey = paramiko.ECDSAKey.from_private_key(io.StringIO(str(base64.b64decode(SSH_KEY), "utf-8")))

# API_DIRECTORY = os.getenv("API_DIRECTORY")
# API_SCRIPT = "run_qwen.py"

# REMOTE_BIND_ADDRESS = ("0.0.0.0", 5353)
# LOCAL_BIND_ADDRESS = ("0.0.0.0", 0)

def start_api():
    """Starts the FastAPI application on the remote server and waits until it is fully ready."""
    # command = (
    #     f"source /home/samuel_goodwin/miniconda3/etc/profile.d/conda.sh && "
    #     f"conda activate llm_production && "
    #     f"cd {API_DIRECTORY} && "
    #     f"(nohup python3 {API_SCRIPT} > api.log 2>&1 & echo $!)"
    # )
    #
    # ssh = paramiko.SSHClient()
    # ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    #
    # try:
    #     print("[INFO] Connecting to SSH...", flush=True)
    #     ssh.connect(SSH_HOST, username=SSH_USERNAME, pkey=ssh_pkey, port=SSH_PORT)
    #     print("before command", flush=True)
    #
    #     stdin, stdout, stderr = ssh.exec_command(command)
    #     print("after command", flush=True)
    #
    #     pid = stdout.readline().strip()
    #     print(f"after pid: {pid}", flush=True)
    #
    #     err_output = stderr.readline().strip()
    #     print(f"after err: {err_output}", flush=True)
    #
    #     if not pid:
    #         print("[ERROR] Failed to start API. No PID received.", flush=True)
    #         print(f"[ERROR] STDERR Output: {err_output}", flush=True)
    #         ssh.close()
    #         return None
    #
    #     print(f"[SUCCESS] API started with PID {pid}", flush=True)
    #
    #     # **Check API Readiness from inside the remote machine**
    #     max_retries = 15
    #     wait_time = 2  # seconds
    #
    #     print("[INFO] Checking API readiness from the remote server...", flush=True)
    #
    #     for attempt in range(max_retries):
    #         try:
    #             # Run curl inside the SSH connection to check the API
    #             check_command = f"curl -s -o /dev/null -w '%{{http_code}}' http://127.0.0.1:5353/"
    #             stdin, stdout, stderr = ssh.exec_command(check_command)
    #             response_code = stdout.read().decode().strip()
    #
    #             if response_code == "200":
    #                 print("[SUCCESS] API is ready and responding.", flush=True)
    #                 ssh.close()
    #                 return pid
    #         except Exception as e:
    #             print(f"[WAIT] API not ready yet (Attempt {attempt + 1}/{max_retries}). Retrying in {wait_time} seconds...", flush=True)
    #
    #         time.sleep(wait_time)
    #
    #     print("[ERROR] API did not start within the expected time.", flush=True)
    #     ssh.close()
    #     return None
    #
    # except Exception as e:
    #     print(f"[ERROR] Exception occurred: {e}", flush=True)
    #     return None


def stop_api():
    """Stops the FastAPI application running on the remote server."""
    # command = f"pkill -f {API_SCRIPT}"
    #
    # ssh = paramiko.SSHClient()
    # ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    #
    # try:
    #     ssh.connect(SSH_HOST, username=SSH_USERNAME, pkey=ssh_pkey, port=34130)
    #     stdin, stdout, stderr = ssh.exec_command(command)
    #     time.sleep(2)  # Give time for the process to terminate
    #     print("API stopped")
    # finally:
    #     ssh.close()