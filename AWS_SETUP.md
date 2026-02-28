# AWS Configuration Guide — Campus-to-Hire

> **Budget:** $200 AWS credits | **Goal:** Keep total spend under $30  
> **Region:** `ap-south-1` (Mumbai) — closest to Indian users, cheapest for Bedrock

---

## Table of Contents

1. [AWS Services Overview](#1-aws-services-overview)
2. [Step 1: AWS Account Setup](#2-step-1-aws-account-setup)
3. [Step 2: Create IAM User (Least Privilege)](#3-step-2-create-iam-user-least-privilege)
4. [Step 3: Enable Amazon Bedrock Models](#4-step-3-enable-amazon-bedrock-models)
5. [Step 4: Verify Amazon Translate Access](#5-step-4-verify-amazon-translate-access)
6. [Step 5: EC2 Instance for Backend (Production)](#6-step-5-ec2-instance-for-backend-production)
7. [Step 6: Configure .env File](#7-step-6-configure-env-file)
8. [Step 7: Test Everything Locally](#8-step-7-test-everything-locally)
9. [Cost Breakdown & Estimates](#9-cost-breakdown--estimates)
10. [CRITICAL: Budget Protection (Billing Alerts & Hard Limits)](#10-critical-budget-protection-billing-alerts--hard-limits)
11. [Cost Optimization Tips](#11-cost-optimization-tips)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. AWS Services Overview

| Service | What It Does in This App | Pricing Model |
|---|---|---|
| **Amazon Bedrock** | AI roadmap generation, interview simulation, JD analysis, content explanations | Per input/output token |
| **Amazon Translate** | Hindi, Tamil, Telugu translation of AI responses | Per character translated |
| **EC2** (optional) | Hosts the FastAPI backend in production | Per hour (free tier: 750 hrs/month t2.micro) |

### Services NOT Needed

| Service | Why Not |
|---|---|
| S3 | No file storage needed for MVP |
| RDS | Using Neon free-tier PostgreSQL instead |
| Lambda | Backend runs on EC2 / locally |
| CloudFront | Vercel handles frontend CDN |
| SageMaker | Using Bedrock, not custom models |

---

## 2. Step 1: AWS Account Setup

### If You Already Have an Account
Skip to [Step 2](#3-step-2-create-iam-user-least-privilege).

### If You're Using AWS Credits ($200)
1. Go to https://aws.amazon.com and sign in
2. Go to **Billing** → **Credits** → Enter your credit code
3. Verify the credit is applied: **Billing Dashboard** → check "Credits" section

> ⚠️ Credits cover most services but **check the credit terms** — some credits exclude specific services.

---

## 3. Step 2: Create IAM User (Least Privilege)

**Never use your root account credentials in code.** Create a dedicated IAM user with only the permissions this app needs.

### A. Create IAM Policy

1. Go to **IAM** → **Policies** → **Create policy**
2. Click **JSON** tab and paste:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "BedrockInvokeModels",
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel",
                "bedrock:InvokeModelWithResponseStream"
            ],
            "Resource": [
                "arn:aws:bedrock:ap-south-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0",
                "arn:aws:bedrock:ap-south-1::foundation-model/anthropic.claude-3-5-haiku-20241022-v1:0",
                "arn:aws:bedrock:ap-south-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0"
            ]
        },
        {
            "Sid": "TranslateAccess",
            "Effect": "Allow",
            "Action": [
                "translate:TranslateText"
            ],
            "Resource": "*"
        }
    ]
}
```

3. Name it: `CampusToHire-AppPolicy`
4. Click **Create policy**

### B. Create IAM User

1. Go to **IAM** → **Users** → **Create user**
2. User name: `campus-to-hire-app`
3. Do NOT enable console access (this is a programmatic-only user)
4. Click **Next**
5. Select **Attach policies directly** → search and select `CampusToHire-AppPolicy`
6. Click **Create user**

### C. Create Access Keys

1. Click on the user `campus-to-hire-app`
2. Go to **Security credentials** tab
3. Click **Create access key**
4. Select **Application running outside AWS** (or "Local code")
5. Click **Create access key**
6. **COPY BOTH VALUES NOW** — you won't see the secret key again:
   - `Access key ID` → goes into `AWS_ACCESS_KEY_ID`
   - `Secret access key` → goes into `AWS_SECRET_ACCESS_KEY`

> 🔒 **NEVER commit these to Git.** They go in `.env` which is in `.gitignore`.

---

## 4. Step 3: Enable Amazon Bedrock Models

> **Note (Feb 2026):** The old "Model access" page has been retired. Serverless foundation models
> now auto-enable on first invocation in any commercial region. No manual activation needed.

### A. Anthropic First-Time Setup

For Anthropic models (Claude), **first-time users must submit use-case details once:**

1. Go to **Amazon Bedrock** → **Model catalog** (left sidebar)
   - Direct URL: https://ap-south-1.console.aws.amazon.com/bedrock/home?region=ap-south-1#/model-catalog
2. Search for **Claude 3 Haiku** and click on it
3. Click **Try in Playground** (or **Request access** if prompted)
4. If you see a **use-case form**, fill it out:
   - **Company/Organization:** Your college name or team name
   - **Use case:** "AI-powered career guidance and interview preparation platform for Indian college students"
   - **Expected usage:** "Low volume prototype — under 1000 requests/month"
   - **Industry:** Education / EdTech
5. Submit and wait — approval is usually **instant to a few minutes**

### B. Verify by Invoking Directly

Once the form is submitted (or if no form was required), test immediately:

1. In the **Bedrock Console** → **Playgrounds** → **Chat playground**
2. Select model: `Anthropic` → `Claude 3 Haiku`
3. Type: "Say hello" → Click **Run**
4. If you get a response, you're good to go ✅

### C. Models You Need (ap-south-1 availability)

| Model | Model ID | Status |
|---|---|---|
| ✅ **Claude 3 Haiku** | `anthropic.claude-3-haiku-20240307-v1:0` | Primary — cheapest, confirmed available |
| ✅ **Claude 3.5 Sonnet** | `anthropic.claude-3-5-sonnet-20241022-v1:0` | Higher quality fallback — $3/$15 per 1M tokens (use sparingly) |
| ❌ Claude 3.5 Haiku | `anthropic.claude-3-5-haiku-20241022-v1:0` | NOT available in ap-south-1 |

**Claude 3 Haiku is all you need.** It's confirmed working and already set in your `.env`.
Auto-enables on first API call — no manual activation required.

### D. Check Region Availability

The app is configured for `ap-south-1` (Mumbai). If a model isn't available there:
- Check: https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html
- Fallback region: `us-east-1` (Virginia) — update `AWS_REGION` in `.env`

> ⚠️ **If using `us-east-1`**, update the IAM policy ARN region from `ap-south-1` to `us-east-1`

### E. IAM Access Control

Administrators can still restrict model access via IAM policies. The policy created in
Step 2 already scopes access to only the models this app needs. No additional
configuration required.

---

## 5. Step 4: Verify Amazon Translate Access

Amazon Translate requires **no special enablement** — it's available by default in `ap-south-1`.

### Quick Verification

Run this in your terminal (with venv activated):

```bash
cd backend
python -c "
import boto3, os
from dotenv import load_dotenv
load_dotenv()

client = boto3.client(
    'translate',
    region_name=os.getenv('AWS_REGION', 'ap-south-1'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
)
result = client.translate_text(
    Text='Hello, how are you?',
    SourceLanguageCode='en',
    TargetLanguageCode='hi'
)
print('✅ Translate working!')
print(f'   Hindi: {result[\"TranslatedText\"]}')
"
```

Expected output:
```
✅ Translate working!
   Hindi: नमस्ते, आप कैसे हैं?
```

---

## 6. Step 5: EC2 Instance for Backend (Production)

> Skip this if you're only running locally for development/demo.

### A. Launch Instance

1. Go to **EC2** → **Launch instance**
2. Configure:
   - **Name:** `campus-to-hire-backend`
   - **AMI:** Amazon Linux 2023 (free tier eligible)
   - **Instance type:** `t2.micro` (free tier) or `t3.micro` ($0.0052/hr in Mumbai)
   - **Key pair:** Create new → `campus-to-hire-key` → Download `.pem` file
   - **Security group:** Create new with these rules:

| Type | Port | Source | Purpose |
|---|---|---|---|
| SSH | 22 | Your IP only | SSH access |
| HTTP | 80 | 0.0.0.0/0 | Web traffic |
| HTTPS | 443 | 0.0.0.0/0 | Secure web traffic |
| Custom TCP | 8000 | 0.0.0.0/0 | FastAPI (dev only — remove in prod) |

3. **Storage:** 20 GB gp3 (free tier covers 30 GB)
4. Click **Launch instance**

### B. Connect & Deploy

```bash
# SSH into your instance
ssh -i ~/.ssh/campus-to-hire-key.pem ec2-user@<YOUR_EC2_PUBLIC_IP>

# Install Docker
sudo yum update -y
sudo yum install -y docker git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Log out and back in for docker group to take effect
exit
ssh -i ~/.ssh/campus-to-hire-key.pem ec2-user@<YOUR_EC2_PUBLIC_IP>

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone your repo
git clone <YOUR_REPO_URL> campus-to-hire
cd campus-to-hire/backend

# Create .env file on the server (paste your env vars)
nano .env

# Build and run with production docker-compose
docker-compose -f docker-compose.prod.yml up -d --build

# Check it's running
curl http://localhost:8000/health
```

### C. IMPORTANT: Stop Instance When Not in Use

```bash
# From your local machine — stop the instance to stop charges
aws ec2 stop-instances --instance-ids <YOUR_INSTANCE_ID> --region ap-south-1

# Start it again when needed
aws ec2 start-instances --instance-ids <YOUR_INSTANCE_ID> --region ap-south-1
```

Or from the **EC2 Console** → Select instance → **Instance state** → **Stop instance**

> 💰 A stopped t3.micro costs $0/hr (you only pay for the 20GB EBS storage: ~$1.60/month).

---

## 7. Step 6: Configure .env File

Update your `backend/.env` with real AWS credentials:

```env
# =============================================
# AWS Configuration — REPLACE THESE VALUES
# =============================================
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIA...YOUR_REAL_KEY
AWS_SECRET_ACCESS_KEY=YOUR_REAL_SECRET_KEY

# =============================================
# Bedrock Model — Use Haiku (cheapest)
# =============================================
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0

# For better quality (2-3x more expensive):
# BEDROCK_MODEL_ID=anthropic.claude-3-5-haiku-20241022-v1:0
```

---

## 8. Step 7: Test Everything Locally

### Test Bedrock Connection

```bash
cd backend
python -c "
import boto3, json, os
from dotenv import load_dotenv
load_dotenv()

client = boto3.client(
    'bedrock-runtime',
    region_name=os.getenv('AWS_REGION', 'ap-south-1'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
)

body = json.dumps({
    'anthropic_version': 'bedrock-2023-05-31',
    'max_tokens': 100,
    'messages': [{'role': 'user', 'content': 'Say hello in one sentence.'}]
})

response = client.invoke_model(
    modelId=os.getenv('BEDROCK_MODEL_ID', 'anthropic.claude-3-haiku-20240307-v1:0'),
    contentType='application/json',
    accept='application/json',
    body=body
)

result = json.loads(response['body'].read())
print('✅ Bedrock working!')
print(f'   Response: {result[\"content\"][0][\"text\"]}')
"
```

### Test Full Backend

```bash
cd backend
# Activate venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Start server
uvicorn app.main:app --reload

# In another terminal, test the health endpoint
curl http://localhost:8000/health
# Expected: {"status":"healthy"}
```

---

## 9. Cost Breakdown & Estimates

### Amazon Bedrock Pricing (ap-south-1)

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Typical Request Cost |
|---|---|---|---|
| **Claude 3 Haiku** | $0.25 | $1.25 | ~$0.001–0.003 |
| Claude 3.5 Haiku | $0.80 | $4.00 | ~$0.003–0.010 |
| Claude 3 Sonnet | $3.00 | $15.00 | ~$0.01–0.05 |
| Claude 3 Opus | $15.00 | $75.00 | ❌ **DO NOT USE** |

### Per-Feature Cost Estimate (using Claude 3 Haiku)

| Feature | Avg Input Tokens | Avg Output Tokens | Cost per Call | Daily Calls (est.) | Daily Cost |
|---|---|---|---|---|---|
| Roadmap Generation | ~2,000 | ~3,000 | $0.004 | 5 | $0.02 |
| Interview (per turn) | ~1,500 | ~500 | $0.001 | 50 | $0.05 |
| JD Analysis | ~1,500 | ~2,000 | $0.003 | 10 | $0.03 |
| Content Explanation | ~1,000 | ~1,500 | $0.002 | 20 | $0.04 |
| **Bedrock Daily Total** | | | | | **~$0.14** |

### Amazon Translate Pricing

| Tier | Price per Character | 500 translations/day (avg 2000 chars) |
|---|---|---|
| Standard | $15 per 1M characters | ~$0.015/day |

### Monthly Cost Projections

| Scenario | Bedrock | Translate | EC2 | Total/Month |
|---|---|---|---|---|
| **Dev/Demo (just you)** | $1–3 | $0.10 | $0 (local) | **~$1–3** |
| **Hackathon Demo (10 users)** | $3–8 | $0.50 | $0 (free tier) | **~$4–9** |
| **Light Production (50 users)** | $10–20 | $2 | $3.80 (t3.micro) | **~$16–26** |
| **Worst Case (heavy use, 200 users)** | $30–60 | $5 | $3.80 | **~$40–70** |

### Total Budget Forecast

| Period | Estimated Spend | Remaining from $200 |
|---|---|---|
| Week 1 (Dev + Testing) | $2–5 | $195–198 |
| Week 2 (Demo + Hackathon) | $5–15 | $180–193 |
| Month 1 (if kept running) | $15–30 | $170–185 |
| **3 Months (max)** | $45–90 | **$110–155 remaining** |

> ✅ **You have plenty of budget.** The main risk is accidentally leaving expensive resources running — see next section.

---

## 10. CRITICAL: Budget Protection (Billing Alerts & Hard Limits)

### ⚠️ THIS IS THE MOST IMPORTANT SECTION — DO NOT SKIP

AWS **will not automatically stop services** when you run out of credits. You must set up protections yourself.

### A. AWS Budgets — Set Up Billing Alerts

1. Go to **AWS Budgets**: https://console.aws.amazon.com/billing/home#/budgets
2. Click **Create a budget**
3. Select **Customized (Advanced)**
4. Configure:

| Setting | Value |
|---|---|
| Budget type | Cost budget |
| Budget name | `campus-to-hire-budget` |
| Period | Monthly |
| Budget amount | `$30` (monthly cap target) |

5. Set **Alert thresholds** (Add ALL of these):

| Threshold | Action |
|---|---|
| 50% ($15) | Email notification — "Halfway through monthly budget" |
| 80% ($24) | Email notification — "Warning: approaching budget limit" |
| 100% ($30) | Email notification — "BUDGET EXCEEDED — stop resources NOW" |
| 120% ($36) | Email notification — "URGENT: over budget" |

6. Enter your email for notifications
7. Click **Create budget**

### B. Create a SECOND Budget for Total Credits

1. Create another budget:

| Setting | Value |
|---|---|
| Budget name | `total-credits-guard` |
| Period | Annually |
| Budget amount | `$150` (stop well before $200) |
| Alert at | 50% ($75), 75% ($112), 90% ($135), 100% ($150) |

### C. AWS Cost Anomaly Detection (Free)

1. Go to **AWS Cost Management** → **Cost Anomaly Detection**
2. Click **Create monitor**
3. Select **AWS Services** → Monitor all services
4. Set alert threshold: `$10` (flag anything unusual above $10)
5. Add your email as a subscriber

### D. CloudWatch Billing Alarm (Belt + Suspenders)

```bash
# Run this from AWS CLI (or do it in the console)
aws cloudwatch put-metric-alarm \
    --alarm-name "BillingAlarm-30USD" \
    --alarm-description "Alarm when AWS charges exceed $30" \
    --metric-name EstimatedCharges \
    --namespace AWS/Billing \
    --statistic Maximum \
    --period 21600 \
    --threshold 30 \
    --comparison-operator GreaterThanThreshold \
    --dimensions Name=Currency,Value=USD \
    --evaluation-periods 1 \
    --alarm-actions <YOUR_SNS_TOPIC_ARN> \
    --region us-east-1
```

Or via Console:
1. Go to **CloudWatch** → **Alarms** → **Billing** (must be in `us-east-1`)
2. **Create alarm** → Select metric → **Billing** → **Total Estimated Charge**
3. Threshold: `$30`
4. Notification: Your email

### E. Nuclear Option: Auto-Stop EC2 When Budget Exceeded

Create a Lambda function triggered by budget alerts to auto-stop your EC2:

1. Go to **Lambda** → **Create function**
2. Name: `stop-ec2-on-budget-breach`
3. Runtime: Python 3.12
4. Paste this code:

```python
import boto3

def lambda_handler(event, context):
    ec2 = boto3.client('ec2', region_name='ap-south-1')
    
    # Replace with your actual instance ID
    instance_ids = ['i-XXXXXXXXXXXXX']
    
    ec2.stop_instances(InstanceIds=instance_ids)
    print(f'Stopped instances: {instance_ids}')
    
    return {
        'statusCode': 200,
        'body': f'Emergency stop: instances {instance_ids} stopped'
    }
```

5. Add IAM permission: `ec2:StopInstances` for your instance
6. Connect it to your budget alert via SNS topic

### F. Daily Habit: Check Your Bill

Bookmark this link and check it daily:
https://console.aws.amazon.com/billing/home#/

---

## 11. Cost Optimization Tips

### 🟢 Do These (Saves Money)

| Tip | Impact |
|---|---|
| **Use Claude 3 Haiku ONLY** (not Sonnet/Opus) | 12-60x cheaper than Opus |
| **Cache Bedrock responses** in the database | Avoid re-generating same content |
| **Stop EC2 when sleeping** | Saves $0.12/day (t3.micro) |
| **Set `max_tokens` appropriately** per endpoint | Don't pay for tokens you don't need |
| **Rate limit your API** (already done: 300/min) | Prevents runaway costs |
| **Use Neon free tier** for PostgreSQL | $0 vs $15+/month for RDS |
| **Use Vercel free tier** for frontend | $0 vs $3.80/month for Amplify |
| **Keep prompts short & focused** | Fewer input tokens = lower cost |

### 🔴 Avoid These (Costs Money Fast)

| Anti-Pattern | Risk |
|---|---|
| **Using Claude 3 Opus** | 60x more expensive than Haiku |
| **Using Claude 3.5 Sonnet v2** | $3/$15 per million tokens |
| **No rate limiting** | One bot can generate $100+ in hours |
| **Running EC2 24/7 without need** | ~$3.80/month for t3.micro |
| **Leaving RDS running** | $15+/month for the smallest instance |
| **Enabling Bedrock logging to S3** | Storage costs add up |
| **Using Provisioned Throughput** | Reserved capacity: $$$$ |
| **Not monitoring costs** | Silent charges accumulate |

### Recommended `max_tokens` Per Feature

Update these in your router files if the defaults are too high:

| Endpoint | Current `max_tokens` | Recommended | Why |
|---|---|---|---|
| Roadmap generation | 4096 | 4096 | Roadmaps are long — keep as is |
| Interview per turn | 4096 | 1024 | Each interview reply is short |
| JD Analysis | 4096 | 2048 | Analysis is moderate length |
| Content explanation | 4096 | 2048 | Explanations are moderate |
| Health check | 10 | 10 | Already optimized ✅ |

### Model Selection Guide

```
Is this a hackathon demo?
  YES → Use Claude 3 Haiku ($0.25 / $1.25 per 1M tokens)
  NO → Is quality critical?
    YES → Use Claude 3.5 Haiku ($0.80 / $4.00 per 1M tokens)  
    NO → Use Claude 3 Haiku
    
NEVER use Claude 3 Opus for this project.
```

---

## 12. Troubleshooting

### Error: AccessDeniedException

```
botocore.exceptions.ClientError: An error occurred (AccessDeniedException) 
when calling the InvokeModel operation
```

**Fix:** Your IAM user doesn't have Bedrock permissions.
1. Check IAM policy is attached to your user
2. Verify the model ARN region matches your `AWS_REGION`
3. Verify you requested model access in Bedrock console

### Error: ResourceNotFoundException

```
ResourceNotFoundException: Could not resolve the foundation model
```

**Fix:** Model not available in your region.
1. Check model availability: https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html
2. Try changing `AWS_REGION` to `us-east-1` in `.env`
3. Update IAM policy ARN region accordingly

### Error: ThrottlingException

```
ThrottlingException: Too many requests
```

**Fix:** You're hitting Bedrock rate limits.
- The app already has retry logic with exponential backoff (3 retries)
- If persistent, request a quota increase in Service Quotas console
- Consider adding request caching to avoid repeated identical calls

### Error: ValidationException

```
ValidationException: messages: roles must alternate between "user" and "assistant"
```

**Fix:** Interview conversation history is malformed.
- Check that messages alternate user/assistant roles
- Ensure no empty messages in the array

### Error: ExpiredTokenException

```
ExpiredTokenException: The security token included in the request is expired
```

**Fix:** If using temporary credentials (STS), they expire.
- Use long-lived IAM user access keys instead (for dev/hackathon)
- Or set up credential rotation for production

### Translate Error: UnsupportedLanguagePairException

**Fix:** Language pair not supported.
- Check supported pairs: https://docs.aws.amazon.com/translate/latest/dg/pairs.html
- All Indian languages (hi, ta, te, bn, mr, gu, kn, ml, pa, ur) are supported from English

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────┐
│           AWS SETUP CHECKLIST                    │
├─────────────────────────────────────────────────┤
│ □ IAM user created with CampusToHire-AppPolicy  │
│ □ Access keys generated and saved in .env       │
│ □ Bedrock model access requested (Claude Haiku) │
│ □ Bedrock test script runs successfully         │
│ □ Translate test script runs successfully       │
│ □ Billing budget set ($30/month)                │
│ □ Total credits budget set ($150)               │
│ □ Cost Anomaly Detection enabled                │
│ □ CloudWatch billing alarm at $30               │
│ □ Bookmark billing dashboard                    │
├─────────────────────────────────────────────────┤
│           DAILY CHECKLIST                        │
├─────────────────────────────────────────────────┤
│ □ Check billing dashboard                       │
│ □ Stop EC2 if not in use                        │
│ □ Review any budget alert emails                │
├─────────────────────────────────────────────────┤
│           MODEL QUICK REFERENCE                  │
├─────────────────────────────────────────────────┤
│ DEFAULT:  anthropic.claude-3-haiku-20240307-v1:0│
│ BETTER:   anthropic.claude-3-5-haiku-20241022.. │
│ NEVER:    anthropic.claude-3-opus-*             │
├─────────────────────────────────────────────────┤
│           EMERGENCY CONTACTS                     │
├─────────────────────────────────────────────────┤
│ Billing: console.aws.amazon.com/billing         │
│ Support: console.aws.amazon.com/support         │
│ Kill EC2: EC2 Console → Stop instance           │
│ Kill ALL: IAM → Deactivate access keys          │
└─────────────────────────────────────────────────┘
```

---

## Emergency: How to Stop ALL AWS Spending Immediately

If you suspect runaway costs:

### Option 1: Deactivate IAM Access Keys (Instant)
1. **IAM** → **Users** → `campus-to-hire-app` → **Security credentials**
2. Click **Deactivate** on the access key
3. This immediately stops all API calls from your app

### Option 2: Stop EC2 Instance
1. **EC2 Console** → Select your instance → **Stop instance**

### Option 3: Delete IAM User (Nuclear)
1. **IAM** → **Users** → `campus-to-hire-app` → **Delete**
2. This revokes all access permanently (you can create a new user later)

> After any emergency action, check your bill at https://console.aws.amazon.com/billing/home#/ and investigate what caused the spike.
