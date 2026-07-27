import os
import sys
import time
import signal
import platform
import threading
import subprocess
import urllib.request
import urllib.error
import re
PORT = 5001
should_run = True
flask_proc = None
tunnel_proc = None

def log(msg):
    print(f"[FORENSIQ] {msg}", flush=True)

def check_backend_alive():
    try:
        urllib.request.urlopen(
            f"http://127.0.0.1:{PORT}/ping",
            timeout=5
        )
        return True
    except:
        return False

def kill_process(proc):
    if proc is None:
        return
    try:
        proc.terminate()
        proc.wait(timeout=5)
    except:
        try:
            proc.kill()
        except:
            pass

def download_cloudflared():
    system = platform.system().lower()
    if system == "windows":
        fname = "cloudflared.exe"
        url = ("https://github.com/cloudflare/"
               "cloudflared/releases/latest/download/"
               "cloudflared-windows-amd64.exe")
    else:
        fname = "cloudflared"
        url = ("https://github.com/cloudflare/"
               "cloudflared/releases/latest/download/"
               "cloudflared-linux-amd64")

    if os.path.exists(fname):
        log(f"cloudflared already exists: {fname}")
        if system != "windows":
            os.chmod(fname, 0o755)
        return fname

    log("Downloading cloudflared...")
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0"}
        )
        with urllib.request.urlopen(req) as r, \
             open(fname, "wb") as f:
            while True:
                chunk = r.read(8192)
                if not chunk:
                    break
                f.write(chunk)
        if system != "windows":
            os.chmod(fname, 0o755)
        log("cloudflared downloaded successfully")
        return fname
    except Exception as e:
        log(f"Failed to download cloudflared: {e}")
        return None

def start_flask():
    global flask_proc
    kill_process(flask_proc)
    time.sleep(2)

    python_exe = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".venv", "Scripts", "python.exe")
    if not os.path.exists(python_exe):
        python_exe = sys.executable

    log("Starting Flask backend on port 5001...")
    flask_proc = subprocess.Popen(
        [python_exe, "-u", "app.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    def print_logs():
        try:
            for line in flask_proc.stdout:
                print(f"[Backend] {line.rstrip()}")
        except:
            pass

    threading.Thread(
        target=print_logs,
        daemon=True
    ).start()

    log("Waiting for backend to start...")
    for i in range(60):
        time.sleep(2)
        if flask_proc.poll() is not None:
            log("Backend process died during startup!")
            return False
        if check_backend_alive():
            log("Backend is ONLINE at 127.0.0.1:5001")
            return True

    log("Backend started but health check uncertain")
    return True

def start_tunnel(cf_bin):
    global tunnel_proc
    kill_process(tunnel_proc)
    time.sleep(2)

    system = platform.system().lower()
    cmd = cf_bin if system == "windows" \
        else "./" + cf_bin

    log("Starting cloudflared tunnel...")
    tunnel_proc = subprocess.Popen(
        [cmd, "tunnel", "--url",
         f"http://127.0.0.1:{PORT}",
         "--no-autoupdate"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )

    deadline = time.time() + 40
    while time.time() < deadline:
        line = tunnel_proc.stderr.readline()
        if not line:
            if tunnel_proc.poll() is not None:
                log("Tunnel process died!")
                break
            time.sleep(0.2)
            continue

        if "trycloudflare.com" in line:
            match = re.search(
                r"https://[a-zA-Z0-9\-]+"
                r"\.trycloudflare\.com",
                line
            )
            if match:
                url = match.group(0)
                log("="*50)
                log(f"PUBLIC URL: {url}")
                log("Paste this in the frontend"
                    " URL field if needed")
                log("="*50)
                try:
                    with open("tunnel_url.txt", "w") as f:
                        f.write(url)
                except Exception as e:
                    log(f"Failed to write tunnel URL: {e}")
                return url

    log("Could not get tunnel URL. "
        "Using 127.0.0.1 only.")
    return None

def monitor_forever(cf_bin):
    global should_run
    backend_fail_count = 0
    tunnel_fail_count = 0
    CHECK_INTERVAL = 60

    log("Monitor started. Checking every "
        f"{CHECK_INTERVAL} seconds...")

    while should_run:
        time.sleep(CHECK_INTERVAL)

        # Check backend
        backend_dead = (
            flask_proc is None or
            flask_proc.poll() is not None or
            not check_backend_alive()
        )

        if backend_dead:
            backend_fail_count += 1
            log(f"Backend offline! Restart "
                f"attempt #{backend_fail_count}")
            started = start_flask()
            if started:
                backend_fail_count = 0
                log("Backend restarted successfully!")
            else:
                log("Backend restart failed. "
                    "Retrying in 20s...")
                continue
        else:
            backend_fail_count = 0

        # Check tunnel
        if cf_bin:
            tunnel_dead = (
                tunnel_proc is None or
                tunnel_proc.poll() is not None
            )
            if tunnel_dead:
                tunnel_fail_count += 1
                log(f"Tunnel died! Restart "
                    f"attempt #{tunnel_fail_count}")
                new_url = start_tunnel(cf_bin)
                if new_url:
                    tunnel_fail_count = 0
                    log("Tunnel restarted!")
                else:
                    log("Tunnel restart failed. "
                        "Retrying next cycle...")
            else:
                tunnel_fail_count = 0

def handle_exit(sig, frame):
    global should_run
    log("Shutting down FORENSIQ AI...")
    should_run = False
    kill_process(flask_proc)
    kill_process(tunnel_proc)
    log("Goodbye!")
    sys.exit(0)

def main():
    signal.signal(signal.SIGINT, handle_exit)
    signal.signal(signal.SIGTERM, handle_exit)

    print("="*50)
    print("  FORENSIQ AI - PERMANENT LAUNCHER")
    print("  Backend auto-restarts if it crashes")
    print("  Tunnel auto-restarts if it dies")
    print("  Press Ctrl+C to stop")
    print("="*50)

    # Start backend
    started = start_flask()
    if not started:
        log("FATAL: Backend could not start!")
        log("Check app.py for errors.")
        sys.exit(1)

    # Download and start tunnel
    cf_bin = download_cloudflared()
    if cf_bin:
        start_tunnel(cf_bin)
    else:
        log("No tunnel - using 127.0.0.1:5001 only")

    # Monitor forever
    try:
        monitor_forever(cf_bin)
    except KeyboardInterrupt:
        handle_exit(None, None)

if __name__ == "__main__":
    main()
