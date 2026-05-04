const fs = require("fs");
const path = require("path");

const existing = JSON.parse(fs.readFileSync(path.join(__dirname, "src/defaultData.json"), "utf8"));

const newNodes = [
  // ── AI Ethics ──────────────────────────────────────────────────────────
  {
    id: "ai-ethics", parentId: "root-ai", sortOrder: 7,
    text: "AI Ethics & Responsible AI",
    description: `AI systems can cause real harm if built carelessly. Ethics is not optional —
it is a core engineering requirement for any production AI system.

━━━━━ WHY ETHICS MATTERS ━━━━━

Real incidents that made headlines:
  COMPAS recidivism tool    — predicted Black defendants as higher-risk at 2x the rate
  Amazon hiring algorithm   — penalised resumes containing the word "women's"
  Facial recognition tools  — 35% higher error rate for dark-skinned women vs white men
  GPT hallucinations        — false facts presented confidently as truth

These are not edge cases — they are direct consequences of ignoring ethics.

━━━━━ TYPES OF BIAS ━━━━━

DATA BIAS:
  Historical bias    — training data reflects historical discrimination
  Sampling bias      — training data does not represent the target population
  Label bias         — human annotators bring their own biases to labelling

MODEL BIAS:
  Proxy discrimination — ZIP code used as proxy for race
  Feedback loops      — biased model → biased outcomes → biased new training data

━━━━━ FAIRNESS METRICS ━━━━━

These often conflict — you must choose which matter for your use case.

  Demographic Parity:  P(pred=1 | group A) = P(pred=1 | group B)
  Equal Opportunity:   Same true positive rate (recall) across groups.
  Equalised Odds:      Both TPR and FPR equal across groups.
  Individual Fairness: Similar individuals should get similar predictions.

  from fairlearn.metrics import demographic_parity_difference
  from fairlearn.reductions import ExponentiatedGradient, DemographicParity

━━━━━ PRIVACY & DATA PROTECTION ━━━━━

GDPR / CCPA:
  Right to explanation  — users can ask why they received a decision.
  Right to erasure      — request their data be deleted.
  Data minimisation     — collect only what you need.

FEDERATED LEARNING:
  Train on decentralised data without raw data leaving devices.
  Google Keyboard (Gboard) uses FL — gradients shared, not raw text.
  pip install flwr   (Flower framework)

DIFFERENTIAL PRIVACY:
  Add calibrated noise so individuals cannot be re-identified.
  from opacus import PrivacyEngine   (DP training for PyTorch)

━━━━━ EXPLAINABILITY (XAI) ━━━━━

SHAP (SHapley Additive exPlanations):
  Assigns each feature a contribution score to the prediction.

  import shap
  explainer = shap.TreeExplainer(model)
  shap_values = explainer.shap_values(X_test)
  shap.summary_plot(shap_values, X_test)

LIME (Local Interpretable Model-agnostic Explanations):
  Fits a simple model locally around a single prediction.
  from lime.lime_tabular import LimeTabularExplainer

GRAD-CAM (for CNNs):
  Highlights which image regions the CNN attended to.
  pip install grad-cam

━━━━━ AI SAFETY ━━━━━

  Alignment problem    — ensuring AI goals match human values
  Reward hacking       — optimising metric in unintended ways
  Distributional shift — model fails on out-of-distribution inputs
  Adversarial examples — tiny pixel changes fool CV models completely

📄 Fairness paper (Chouldechova 2017): https://arxiv.org/abs/1703.00056
📄 Limitations of ML fairness: https://arxiv.org/abs/1808.00023
🎥 AI Ethics (MIT 6.S897): https://www.youtube.com/watch?v=ggzWIipKraM
📚 Fairlearn toolkit: https://fairlearn.org/
📚 AI Fairness 360 (IBM): https://aif360.res.ibm.com/`,
  },

  // ── Time Series ─────────────────────────────────────────────────────────
  {
    id: "time-series", parentId: "month3", sortOrder: 7,
    text: "Time Series Forecasting",
    description: `Predicting future values of a time-ordered sequence.
Used in: finance, energy, weather, demand planning, IoT sensors.

━━━━━ WHAT MAKES TIME SERIES DIFFERENT ━━━━━

  Temporal order matters — you cannot randomly shuffle rows.
  Autocorrelation       — past values help predict future values.
  Seasonality           — repeating patterns (daily, weekly, yearly).
  Trend                 — long-term increase or decrease.
  Non-stationarity      — statistical properties change over time.

━━━━━ CLASSICAL METHODS ━━━━━

ARIMA (AutoRegressive Integrated Moving Average):
  AR(p): regression on p past values.
  I(d):  differencing to make the series stationary.
  MA(q): regression on q past error terms.

  from statsmodels.tsa.arima.model import ARIMA
  model = ARIMA(series, order=(2, 1, 2))
  results = model.fit()
  forecast = results.forecast(steps=30)

SARIMA: seasonal ARIMA — adds (P,D,Q,m) seasonal terms.

━━━━━ PROPHET (META) ━━━━━

Designed for business forecasting. Automatically handles:
  Trend changepoints, yearly/weekly/daily seasonality, holidays, missing data.

  pip install prophet
  from prophet import Prophet
  import pandas as pd

  df = pd.DataFrame({"ds": dates, "y": values})
  model = Prophet(
      yearly_seasonality=True,
      weekly_seasonality=True,
      changepoint_prior_scale=0.05,
  )
  model.add_country_holidays(country_name="US")
  model.fit(df)
  future   = model.make_future_dataframe(periods=365)
  forecast = model.predict(future)
  model.plot(forecast)
  model.plot_components(forecast)    # trend + seasonality

━━━━━ LSTM FOR TIME SERIES ━━━━━

Best for: complex non-linear patterns, multiple input features.

  def create_sequences(data, window=30):
      X, y = [], []
      for i in range(len(data) - window):
          X.append(data[i : i+window])
          y.append(data[i+window])
      return np.array(X), np.array(y)

  class LSTMForecaster(nn.Module):
      def __init__(self):
          super().__init__()
          self.lstm = nn.LSTM(input_size=1, hidden_size=64,
                               num_layers=2, batch_first=True, dropout=0.2)
          self.fc = nn.Linear(64, 1)
      def forward(self, x):
          out, _ = self.lstm(x)
          return self.fc(out[:, -1, :])    # last time step only

━━━━━ TEMPORAL FUSION TRANSFORMER (TFT) ━━━━━

State-of-the-art for tabular time series. Handles:
  Multiple input variables, known future inputs, static metadata.
  Interpretable attention — see which time steps the model focused on.

  pip install pytorch-forecasting
  from pytorch_forecasting import TemporalFusionTransformer, TimeSeriesDataSet

━━━━━ EVALUATION METRICS ━━━━━

  MAE   — Mean Absolute Error (same units as target, interpretable)
  RMSE  — Root Mean Squared Error (penalises large errors more)
  MAPE  — Mean Absolute Percentage Error (scale-independent)
  MASE  — Mean Absolute Scaled Error (compares to naive forecast)

━━━━━ TRAIN/TEST SPLIT — TIME ORDER MUST BE PRESERVED ━━━━━

NEVER randomly shuffle time series data!
  Train: first 80% of the time period.
  Test:  last 20%.

  from sklearn.model_selection import TimeSeriesSplit
  tscv = TimeSeriesSplit(n_splits=5)   # walk-forward validation

📄 TFT paper (Lim et al. 2021): https://arxiv.org/abs/1912.09363
📄 Prophet paper (Taylor & Letham): https://peerj.com/preprints/3190/
🎥 Time Series with Python (StatQuest): https://www.youtube.com/watch?v=GE3JOFwTWVM
🎥 LSTM for time series (Sentdex): https://www.youtube.com/watch?v=S8tpSG6Q2H0
📚 Forecasting: Principles & Practice (FREE book): https://otexts.com/fpp3/`,
  },

  // ── Recommendation Systems ─────────────────────────────────────────────
  {
    id: "rec-systems", parentId: "month2", sortOrder: 5,
    text: "Recommendation Systems",
    description: `Recommendation systems power Netflix, Spotify, Amazon, YouTube.
They learn user preferences to surface relevant items from millions of choices.

━━━━━ THREE MAIN APPROACHES ━━━━━

COLLABORATIVE FILTERING:
  "Users like you also liked X."
  Learns from user-item interactions (ratings, clicks, purchases).
  Does NOT need item content — purely behaviour-based.

CONTENT-BASED FILTERING:
  "You liked item A. Here are items with similar attributes."
  Uses item features (genre, keywords, embeddings).
  Does NOT need other users — works for new users once they rate something.

HYBRID (production standard):
  Combine both. Netflix, Spotify, and YouTube all use hybrid systems.

━━━━━ MATRIX FACTORISATION ━━━━━

Decompose the sparse user-item rating matrix into:
  U [n_users × k]  and  V [n_items × k]
  Predicted rating: r_ui = U_u · V_i (dot product)

  Learn U and V by minimising MSE on known ratings + regularisation.

  from surprise import SVD, Dataset, Reader
  from surprise.model_selection import cross_validate

  reader = Reader(rating_scale=(1, 5))
  data = Dataset.load_from_df(df[["userId","movieId","rating"]], reader)
  algo = SVD(n_factors=50, n_epochs=20)
  cross_validate(algo, data, measures=["RMSE","MAE"], cv=5, verbose=True)

━━━━━ NEURAL COLLABORATIVE FILTERING (NCF) ━━━━━

Replace dot product with an MLP for non-linear interactions.

  class NCF(nn.Module):
      def __init__(self, n_users, n_items, emb_dim=32):
          super().__init__()
          self.user_emb = nn.Embedding(n_users, emb_dim)
          self.item_emb = nn.Embedding(n_items, emb_dim)
          self.mlp = nn.Sequential(
              nn.Linear(emb_dim*2, 64), nn.ReLU(),
              nn.Linear(64, 32),        nn.ReLU(),
              nn.Linear(32, 1),
          )
      def forward(self, user, item):
          u = self.user_emb(user)
          i = self.item_emb(item)
          return self.mlp(torch.cat([u, i], dim=1)).squeeze()

━━━━━ TWO-TOWER MODEL (industry standard) ━━━━━

  Query tower:  encode user + context → query vector
  Item tower:   encode item attributes → item vector
  Score:        cosine_similarity(query, item)

  At inference: pre-compute all item vectors offline.
  Use FAISS (approximate nearest neighbour search) for fast retrieval.
  Powers: YouTube, Google, TikTok, Pinterest.

━━━━━ CONTENT-BASED WITH EMBEDDINGS ━━━━━

  from sentence_transformers import SentenceTransformer
  model = SentenceTransformer("all-MiniLM-L6-v2")
  item_vecs = model.encode(item_descriptions)    # [n_items, 384]

  import faiss
  index = faiss.IndexFlatIP(384)
  faiss.normalize_L2(item_vecs)
  index.add(item_vecs)
  D, I = index.search(query_vec, k=10)           # top-10 similar

━━━━━ EVALUATION METRICS ━━━━━

  Precision@K  — of top K recommendations, fraction actually relevant
  Recall@K     — of all relevant items, fraction in top K
  NDCG@K       — normalised discounted cumulative gain (rank-sensitive)
  Hit Rate     — 1 if relevant item appears in top K, else 0
  RMSE/MAE     — for explicit ratings (1–5 stars)

━━━━━ COLD START PROBLEM ━━━━━

  New user: no history → use popularity-based or ask for initial preferences.
  New item: no ratings → use content-based until it accumulates interactions.

📄 NCF paper (He et al. 2017): https://arxiv.org/abs/1708.05031
📄 YouTube DNN Recommendations: https://arxiv.org/abs/1507.07527
🎥 Recommendation Systems (Google ML course): https://developers.google.com/machine-learning/recommendation
🎥 Matrix Factorisation (StatQuest): https://www.youtube.com/watch?v=ZspR5PZemcs
🛠️ Surprise library: https://surpriselib.com/`,
  },

  // ── Career & Interview ─────────────────────────────────────────────────
  {
    id: "career-interview", parentId: "root-ai", sortOrder: 8,
    text: "AI Career & Interview Prep",
    description: `Landing an AI/ML job requires both technical depth and the ability to
communicate your work clearly. This node covers everything you need.

━━━━━ ML ENGINEER vs DATA SCIENTIST ━━━━━

DATA SCIENTIST:
  Focus: insight, business decisions, analysis.
  Skills: statistics, SQL, visualisation, modelling.
  Output: dashboards, reports, notebooks.

ML ENGINEER:
  Focus: production systems, scale, reliability.
  Skills: software engineering + ML + MLOps.
  Output: deployed APIs, data pipelines, model infrastructure.

RESEARCH SCIENTIST:
  Focus: advancing the state of the art.
  Skills: deep math, paper reading/writing, experiments.
  Output: papers, novel architectures.

━━━━━ TECHNICAL INTERVIEW TOPICS ━━━━━

ML THEORY:
  Bias-variance tradeoff
  L1 vs L2 regularisation — why does L1 produce sparse weights?
  How does gradient descent work? Explain Adam.
  Vanishing gradient — how does LSTM solve it?
  Derive backpropagation mathematically.
  Why use batch normalisation? What problem does it solve?
  Precision vs Recall tradeoff — when to prioritise each?
  Derive cross-entropy loss from maximum likelihood.

PRACTICAL ML:
  How do you handle class imbalance?
  How do you debug overfitting? Underfitting?
  Walk me through an ML project end-to-end.
  How would you choose between tree models and neural networks?

SYSTEM DESIGN FOR ML (very common at senior levels):
  Design a recommendation system for Netflix.
  Design a fraud detection system.
  How do you serve a model to 1 million concurrent users?
  Design a content moderation system.

━━━━━ ML SYSTEM DESIGN FRAMEWORK ━━━━━

Answer in this order for any ML system design question:
  1. Clarify requirements (scale, latency, accuracy SLAs)
  2. Problem framing (what ML task? what label? proxy metrics?)
  3. Data pipeline (collection, labelling, storage)
  4. Features (what features? real-time vs batch?)
  5. Model choice (why this architecture?)
  6. Training (distributed? how often retrain?)
  7. Evaluation (offline metrics, A/B test design)
  8. Deployment (serving infra, latency budget, canary)
  9. Monitoring (drift detection, alerting, retraining triggers)

━━━━━ PORTFOLIO CHECKLIST ━━━━━

✓ 3–5 pinned GitHub repos — each with clear README + results
✓ At least one deployed project (not just a notebook)
✓ Kaggle: 1+ competition in top 30–40%
✓ Write about your projects (blog, LinkedIn)
✓ One paper implementation shows you can read research

━━━━━ SALARY RANGES (India, 2025) ━━━━━

  Fresher ML Engineer:  12–25 LPA
  2–3 yrs experience:   25–50 LPA
  Senior / Staff MLE:   50–100+ LPA
  Research Scientist:   30–80 LPA

TOP COMPANIES:
  Global: Google, Meta, OpenAI, Microsoft, Amazon, Apple, Netflix
  India:  Flipkart, Swiggy, Zomato, CRED, Meesho, PhonePe, Juspay

🎥 ML interviews (Chip Huyen): https://huyenchip.com/ml-interviews-book/
📚 Designing ML Systems: https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/
🎥 ML system design (Exponent YT): https://www.youtube.com/watch?v=nJW1y7tKbBs
📚 ML cheatsheet: https://ml-cheatsheet.readthedocs.io/`,
  },

  // ── Environment Setup ──────────────────────────────────────────────────
  {
    id: "env-setup", parentId: "month1", sortOrder: 3,
    text: "Development Environment Setup",
    description: `Set this up once and it serves all 4 months of learning.

━━━━━ OPTION A: LOCAL SETUP (recommended for serious work) ━━━━━

STEP 1 — Install Miniconda:
  Download: https://docs.conda.io/en/latest/miniconda.html
  Miniconda manages separate Python environments per project.

STEP 2 — Create AI environment:
  conda create -n ai python=3.11 -y
  conda activate ai

STEP 3 — Install packages:
  pip install numpy pandas matplotlib seaborn jupyter
  pip install scikit-learn xgboost lightgbm
  pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
  pip install transformers datasets accelerate peft
  pip install fastapi uvicorn mlflow
  pip install opencv-python pillow albumentations

STEP 4 — VS Code:
  Install: Python extension, Jupyter extension, Pylance.
  Select interpreter → choose the (ai) conda environment.

STEP 5 — Verify GPU (NVIDIA):
  python -c "import torch; print(torch.cuda.is_available())"
  python -c "import torch; print(torch.cuda.get_device_name(0))"

━━━━━ OPTION B: GOOGLE COLAB (zero setup, free GPU) ━━━━━

URL: https://colab.research.google.com
Free T4 GPU (15GB VRAM), 12GB RAM.

  !pip install transformers accelerate   # install extra packages
  !nvidia-smi                            # check GPU

  from google.colab import drive
  drive.mount("/content/drive")          # persistent file storage

LIMITATIONS: session resets every 12 hours, GPU queue during peak.
Colab Pro ($10/month) — priority GPU, longer sessions.

━━━━━ OPTION C: KAGGLE NOTEBOOKS ━━━━━

Free P100/T4 GPU (30 hours/week). All ML packages pre-installed.
Best for: Kaggle competitions and sharing work publicly.

━━━━━ RECOMMENDED PROJECT STRUCTURE ━━━━━

  ai-learning/
  ├── month1/        (numpy, pandas, matplotlib)
  ├── month2/        (sklearn, ml algorithms)
  ├── month3/        (pytorch, deep learning)
  ├── month4/        (nlp, cv, deployment)
  └── projects/      (capstone work)

  Keep one notebook per topic. Commit to GitHub regularly.

📚 Miniconda install guide: https://docs.conda.io/en/latest/miniconda.html
📚 VS Code Python tutorial: https://code.visualstudio.com/docs/python/python-tutorial
🎥 Full setup tutorial (Nicholas Renotte): https://www.youtube.com/watch?v=GZFbCIOcFoI`,
  },

  // ── Communities ────────────────────────────────────────────────────────
  {
    id: "communities", parentId: "resources", sortOrder: 1,
    text: "Communities, Blogs & People to Follow",
    description: `Learning alone is slow. These communities will keep you updated and
connect you with practitioners actively working in the field.

━━━━━ REDDIT ━━━━━

  r/MachineLearning        — research discussions, paper links
  r/learnmachinelearning   — beginners welcome, project feedback
  r/deeplearning           — DL-specific
  r/LocalLLaMA             — running LLMs locally

━━━━━ DISCORD ━━━━━

  Hugging Face Discord:  https://discord.gg/hugging-face
  Fast.ai Discord:       https://discord.gg/fastai
  Weights & Biases:      MLOps-focused community

━━━━━ TWITTER / X — MUST FOLLOW ━━━━━

  @karpathy         — Andrej Karpathy (ex-Tesla AI, ex-OpenAI)
  @ylecun           — Yann LeCun (Meta Chief AI Scientist)
  @goodfellow_ian   — Ian Goodfellow (GAN inventor)
  @fchollet         — François Chollet (Keras creator)
  @ClementDelangue  — Clem Delangue (Hugging Face CEO)
  @rasbt            — Sebastian Raschka (ML educator, great posts)

━━━━━ BEST BLOGS ━━━━━

TECHNICAL (must bookmark):
  Lilian Weng (OpenAI):       https://lilianweng.github.io/
  Jay Alammar (visualisations): https://jalammar.github.io/
  Sebastian Ruder (NLP):       https://www.ruder.io/
  Distill (interactive papers): https://distill.pub/

NEWSLETTERS:
  The Batch (Andrew Ng):      https://www.deeplearning.ai/the-batch/
  Andrej Karpathy blog:       https://karpathy.github.io/

━━━━━ YOUTUBE CHANNELS (RANKED) ━━━━━

MUST SUBSCRIBE:
  3Blue1Brown         — maths intuition, beautiful visualisations
  StatQuest           — ML explained clearly (best for beginners → intermediate)
  Andrej Karpathy     — deep technical DL walkthroughs
  Yannic Kilcher       — paper reviews, very detailed

GREAT FOR PROJECTS:
  Nicholas Renotte    — hands-on DL project tutorials
  Krish Naik          — end-to-end ML projects (very popular in India)
  Sentdex             — practical Python + ML

STAY UPDATED:
  Two Minute Papers   — 2-min summaries of latest AI papers

━━━━━ TOP CONFERENCES (papers released here) ━━━━━

  NeurIPS   — top ML conference (December)
  ICML      — top ML conference (July)
  ICLR      — top DL conference (May)
  CVPR      — top computer vision conference
  ACL/EMNLP — top NLP conferences

  All papers free on arXiv. Talks on YouTube.
  Daily paper highlights: https://huggingface.co/papers`,
  },
];

// Merge
const all = [...existing];
for (const n of newNodes) {
  if (!all.find(x => x.id === n.id)) {
    all.push(n);
    console.log("+ Added:", n.text);
  } else {
    console.log("~ Skipped (exists):", n.text);
  }
}

fs.writeFileSync(path.join(__dirname, "src/defaultData.json"), JSON.stringify(all, null, 2));
console.log("\nTotal nodes in defaultData.json:", all.length);
