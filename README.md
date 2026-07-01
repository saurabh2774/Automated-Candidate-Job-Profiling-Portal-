# 🚀 Automated Candidate Job-Profiling Portal through Similarity Measurement Prediction

An AI-powered recruitment platform that intelligently predicts the suitability between candidate resumes and employer job descriptions using Natural Language Processing (NLP), Hybrid Feature Engineering, and Machine Learning.

The system automates resume screening, extracts structured skill information, compares candidate skills with job requirements, and predicts suitability as:

- ✅ MOS – Most Suitable
- 🟡 MDS – Moderately Suitable
- 🔴 NTS – Not Suitable

The platform provides secure authentication, role-based dashboards, real-time predictions, and explainable suitability analysis.

---

# 📖 Features

## Candidate Module

- Candidate Registration & Login
- Resume Upload (PDF)
- Job Search
- Apply for Jobs
- View Suitability Scores
- View Prediction History

## Employer Module

- Employer Registration & Login
- Create Job Postings
- View Applicants
- Candidate Ranking
- Suitability Prediction Dashboard

## AI Module

- Resume Text Extraction
- NLP-based Skill Extraction
- Primary Skills Extraction
- Secondary Skills Extraction
- Adjective & Adverb Extraction
- Hybrid Feature Engineering
- XGBoost Prediction
- Explainable Suitability Scores

---

# 🏗 Tech Stack

## Frontend

- Next.js
- React.js
- Tailwind CSS
- NextAuth

## Backend

- FastAPI
- Python

## Database

- MongoDB
- GridFS

## Artificial Intelligence

- spaCy
- NLTK
- Scikit-learn
- XGBoost
- NumPy
- Pandas

---

# 🧠 AI Workflow

Resume Upload

↓

PDF Text Extraction (PyPDF)

↓

Text Cleaning

↓

Natural Language Processing

- Tokenization
- Lemmatization
- POS Tagging
- Stopword Removal
- Skill Extraction

↓

Hybrid Feature Engineering

- TF-IDF
- Cluster Similarity
- Skill Count

↓

XGBoost Classification

↓

MOS / MDS / NTS

↓

Dashboard

---

# 📂 Project Structure

```
project/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── pages/
│   └── authentication/
│
├── backend/
│   ├── api/
│   ├── ai/
│   ├── models/
│   ├── utils/
│   └── database/
│
├── datasets/
├── models/
├── requirements.txt
└── README.md
```

---

# ⚙️ Libraries Used

| Library | Purpose |
|----------|---------|
| PyPDF | Resume text extraction |
| spaCy | Tokenization, Lemmatization, POS Tagging |
| NLTK | Stopword Removal |
| Scikit-learn | TF-IDF & Feature Engineering |
| NumPy | Numerical Processing |
| Pandas | Dataset Handling |
| XGBoost | Suitability Prediction |
| FastAPI | REST APIs |
| MongoDB | Database |
| GridFS | Resume Storage |
| Next.js | Frontend |
| Tailwind CSS | UI Design |
| NextAuth | Authentication |

---

# 🔍 Hybrid Feature Engineering

The prediction model combines multiple features instead of relying on a single technique.

Features include:

- Cluster Similarity
- TF-IDF
- Skill Count
- Resume Feature Vector
- Job Description Feature Vector

These features are merged into a hybrid feature vector and passed to the XGBoost model.

---

# 🤖 Machine Learning Model

Algorithm Used:

- XGBoost Classifier

Prediction Classes:

- MOS (Most Suitable)
- MDS (Moderately Suitable)
- NTS (Not Suitable)

---

# 🔑 Authentication

The platform uses NextAuth with Credentials Provider.

Features:

- Secure Login
- Session Management
- Candidate Authentication
- Employer Authentication
- Role-Based Authorization

---

# 📊 Future Enhancements

- BERT-based Semantic Matching
- Resume Ranking
- AI Chatbot Interview
- Cloud Deployment
- SHAP/LIME Explainability
- LinkedIn Integration
- Automated Interview Scheduling

---

# 🎯 Applications

- Campus Recruitment
- Corporate Hiring
- HR Automation
- Resume Screening
- Job Recommendation Systems
- Intelligent Recruitment Platforms

---

# 👨‍💻 Team Members

- Saurabh Chikte
- Rohit Dhule
- Haridas Chavan
- Manas Gaikwad

Guide:
Mrs. Mayuri Botre

Department of Computer Engineering

Dr. D. Y. Patil Institute of Technology, Pimpri, Pune

Academic Year: 2025–2026

---

# 📜 License

This project was developed as a Final Year B.E. Computer Engineering Project for academic and research purposes.
