// enrich-nodes.cjs  — run with: node enrich-nodes.cjs
const fs   = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'src', 'defaultData.json');
const nodes    = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// ─── Rich descriptions keyed by node id ───────────────────────────────────
const updates = {

// ═══════════════════════════════════════════════════════════════════════════
'root-ai': `Your complete 4-month journey into Artificial Intelligence.

━━━ WHAT IS AI? ━━━

AI = making machines perform tasks that normally require human intelligence:
understanding language, recognising images, making decisions, generating text.

REAL-WORLD AI YOU ALREADY USE EVERY DAY:
• Google Search         — ranks 200B pages using ML models
• YouTube/Netflix       — recommends next video from 800M+ videos
• Gmail Smart Compose   — completes your sentences with LLMs
• Google Maps ETA       — predicts travel time from millions of trips
• Face Unlock (iPhone)  — 3D face recognition CNN, < 1ms
• Spotify Discover      — recommends music using collaborative filtering
• GitHub Copilot        — code completion using 12B-param CodeX LLM
• ChatGPT / Claude      — 70B-700B parameter transformer models

━━━ AI SUBFIELDS MAP ━━━

  ARTIFICIAL INTELLIGENCE
  └── Machine Learning (ML)          ← algorithms that learn from data
      ├── Supervised Learning         ← labelled data → predict output
      ├── Unsupervised Learning        ← find patterns, no labels
      ├── Reinforcement Learning (RL)  ← agent learns via trial + reward
      └── Deep Learning (DL)          ← multi-layer neural networks
          ├── Computer Vision (CV)     ← images, video, cameras
          ├── NLP / LLMs              ← text, speech, language
          ├── Generative AI           ← create new content
          └── Multimodal AI           ← combine text + image + audio

━━━ YOUR BACKGROUND (Java developer) ━━━

You already know: OOP, data structures, algorithms, collections, functions.
Python will feel like a simpler Java. Most AI code follows this pattern:

  load_data() → preprocess() → build_model() → train() → evaluate() → predict()

You will NOT be writing AI from scratch — you will use libraries (PyTorch,
scikit-learn, HuggingFace) the same way you use Java frameworks.

━━━ THE 4-MONTH PLAN ━━━

Month 1  Python + Math  — tools and foundations (2–3 hrs/day)
Month 2  Classical ML   — scikit-learn, real tabular ML projects
Month 3  Deep Learning  — neural nets, PyTorch, CNNs, Transformers
Month 4  Specialise     — NLP/CV deep dive + deploy a real model

━━━ WHAT YOU WILL BE ABLE TO DO AFTER 4 MONTHS ━━━

✓ Build and deploy a text classifier (spam, sentiment, topic)
✓ Build an image classifier with transfer learning (ResNet/EfficientNet)
✓ Fine-tune a pre-trained LLM on your own data
✓ Build a RAG chatbot over your own documents
✓ Deploy any model as a REST API with FastAPI + Docker
✓ Track experiments with MLflow, monitor for drift in production
✓ Read and understand ML research papers

━━━ REALISTIC DAILY SCHEDULE ━━━

Morning (45 min):  Read concept + watch 1 video
Afternoon (1 hr):  Code it yourself — no copy-paste
Evening (30 min):  Kaggle dataset practice or mini project

🎥 3Blue1Brown Neural Networks (MUST START HERE): https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi
🎥 Fast.ai Practical Deep Learning (FREE, code-first): https://course.fast.ai/
📚 Deep Learning Book (Goodfellow, FREE): https://www.deeplearningbook.org/
🏆 Kaggle (practice + datasets): https://www.kaggle.com/`,

// ═══════════════════════════════════════════════════════════════════════════
'month1': `Month 1 goal: Python fluency + math intuition for AI.
By the end of this month you should be able to load any CSV, clean it,
visualise it, and understand the math behind gradient descent.

━━━ WEEK-BY-WEEK BREAKDOWN ━━━

WEEK 1 — NumPy + Pandas (the data tools)
  Day 1–2: NumPy arrays, broadcasting, vectorised operations
  Day 3–4: Pandas — load CSV, clean nulls, groupby, merge
  Day 5–6: Matplotlib + Seaborn — histograms, scatter, heatmaps
  Day 7:   Mini project — load Titanic dataset, run EDA, export cleaned CSV

WEEK 2 — Jupyter + Python fluency
  Day 1–3: Python vs Java reference (list comprehensions, dicts, functions)
  Day 4–5: Jupyter keyboard shortcuts, markdown, magic commands
  Day 6–7: Reproduce a full EDA notebook for a Kaggle dataset

WEEK 3 — Linear Algebra for AI
  Day 1–2: Vectors, dot products, matrix multiplication
  Day 3–4: Eigenvalues, PCA intuition (conceptual only)
  Day 5–7: Implement a neural net forward pass from scratch using NumPy

WEEK 4 — Calculus & Statistics
  Day 1–3: Derivatives, partial derivatives, chain rule, gradient descent
  Day 4–5: Probability, distributions, Bayes theorem
  Day 6–7: Statistics — mean/std/correlation, hypothesis test intuition

━━━ REAL-WORLD CONTEXT ━━━

NumPy powers: TensorFlow and PyTorch are both built on NumPy-like arrays.
Pandas powers: Every Kaggle competition solution starts with df.head().
Matplotlib powers: Papers at NeurIPS include plots made with Matplotlib.

━━━ ENVIRONMENT SETUP ━━━

Best for learning: Google Colab (zero setup, free GPU)
https://colab.research.google.com

Local (for serious work):
  conda create -n ai python=3.11 && conda activate ai
  pip install numpy pandas matplotlib seaborn jupyter scikit-learn torch

━━━ WEEKLY CHECKPOINT ━━━

End of Month 1 you should be able to:
  ✓ Load and clean any CSV with Pandas without googling syntax
  ✓ Create meaningful visualisations for numeric and categorical data
  ✓ Explain gradient descent using a hand-drawn diagram
  ✓ Implement a dot product and a simple linear transform in NumPy

🎥 Python for Everybody (free audit): https://www.coursera.org/specializations/python
🎥 Math for ML (3Blue1Brown playlist): https://www.youtube.com/c/3blue1brown
📚 Python Tutorial (official): https://docs.python.org/3/tutorial/`,

// ═══════════════════════════════════════════════════════════════════════════
'python-libs': `Four libraries that underpin every AI project in the world.
Google, Netflix, Tesla, Spotify — they all start with these same tools.

━━━ 1. NumPy — The Speed Engine ━━━

WHY IT EXISTS:
  Pure Python loop over 1M numbers: ~100 ms
  NumPy vectorised operation:       ~1 ms    (100× faster, runs in C)

REAL WORLD EXAMPLE:
  A Tesla camera frame = NumPy array of shape [3, 224, 224]
  (3 colour channels, 224 pixels tall, 224 pixels wide).
  Every neural net weight matrix IS a NumPy array.

KEY OPERATIONS:
  import numpy as np
  a = np.array([1.0, 2.0, 3.0])
  a * 2                     # [2, 4, 6]  — no loop needed
  np.dot(a, a)              # 14.0       — used in every dense layer
  a.reshape(3, 1)           # column vector

MASTER THIS: array creation, slicing [0:3, 1:4], broadcasting, dot product.

━━━ 2. Pandas — The Data Surgeon ━━━

WHY IT EXISTS:
  Raw datasets are always messy: missing values, wrong types, duplicates.
  Pandas lets you fix this in minutes instead of hours.

REAL WORLD EXAMPLE:
  An Airbnb data scientist loads 2M rows of booking data,
  merges with a pricing table, fills missing reviews with median,
  and creates a "price_per_bedroom" feature — all in < 20 lines.

  df = pd.read_csv("airbnb.csv")
  df["price_per_room"] = df["price"] / df["bedrooms"]
  df.dropna(subset=["price"]).groupby("city")["price"].mean()

MASTER THIS: read_csv, head/info/describe, dropna/fillna, groupby, merge, value_counts.

━━━ 3. Matplotlib + Seaborn — See Your Data ━━━

RULE: Always visualise data BEFORE training any model.
A histogram might show you that "age" has values like 999 (data error).
A correlation heatmap might show two features are 99% correlated (drop one).

REAL WORLD EXAMPLE:
  Netflix engineers plot viewing duration distributions per country.
  Outlier spike at 0 min = user opened app and closed immediately.
  This is caught with a histogram — not by training a model.

KEY PLOTS TO KNOW:
  Histogram          — distribution of a single feature
  Scatter plot       — relationship between two features
  Correlation heatmap— which features are redundant?
  Box plot           — find outliers quickly
  Loss curves        — is your neural net actually training?

━━━ 4. Jupyter Notebooks — Your Laboratory ━━━

WHY IT EXISTS:
  Normal Python scripts run top-to-bottom, always from scratch.
  Jupyter runs cell-by-cell — load a 5GB dataset once, then experiment
  on it for hours without reloading.

REAL WORLD EXAMPLE:
  Almost every Kaggle competition solution is a Jupyter notebook.
  Every ML paper on arXiv ships with a Colab notebook you can run.
  DeepMind, OpenAI, and Google Brain all publish Colab demos.

ESSENTIAL SHORTCUTS:
  Shift+Enter   — run cell + move to next
  A / B         — insert cell above / below
  D D           — delete cell
  Tab           — autocomplete
  Shift+Tab     — show function signature

FREE GPU: Google Colab gives you a T4 GPU (15 GB VRAM) for free.
  https://colab.research.google.com

🎥 NumPy full tutorial (freeCodeCamp): https://www.youtube.com/watch?v=QUT1VHiLmmI
🎥 Pandas tutorial (Corey Schafer): https://www.youtube.com/watch?v=ZyhVh-qRZPA
🎥 Matplotlib tutorial: https://www.youtube.com/watch?v=UO98lJQ3QGI
📚 NumPy 100 exercises: https://github.com/rougier/numpy-100`,

// ═══════════════════════════════════════════════════════════════════════════
'math-ai': `Three areas of math that make AI work. You do NOT need to become
a mathematician — you need conceptual understanding to debug models intelligently.

━━━ WHY MATH MATTERS ━━━

SCENARIO 1: Your neural net training loss is not decreasing.
  → You need calculus to understand: learning rate too high? Vanishing gradient?

SCENARIO 2: Two features in your dataset are highly correlated.
  → You need linear algebra to understand PCA and why you should drop one.

SCENARIO 3: Your model accuracy is 95% but still misses all fraud cases.
  → You need statistics to understand class imbalance and F1 vs accuracy.

━━━ 1. LINEAR ALGEBRA — HOW DATA IS STORED ━━━

Every piece of data in AI is a number in a matrix or tensor:
  A black-and-white image  = matrix [H × W]
  A colour image (RGB)     = tensor [3 × H × W]
  A sentence (tokenised)   = matrix [seq_len × embedding_dim]
  A neural net weight layer= matrix [output_size × input_size]

EVERY FORWARD PASS in a neural network is:
  output = activation(W @ input + b)
  W is a matrix. @ is matrix multiplication. This repeats for every layer.

A GPT model with 70 billion parameters is just billions of numbers
in weight matrices. The "forward pass" is W1 @ W2 @ W3 @ ... 96 times.

KEY THINGS TO UNDERSTAND: vector, matrix, dot product, matrix multiply (@ in Python), transpose, dimensionality.

🎥 Essence of Linear Algebra (3Blue1Brown, 16 videos, ESSENTIAL): https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab

━━━ 2. CALCULUS — HOW MODELS LEARN ━━━

A model learns by minimising a loss function.
To minimise: compute the gradient (direction of steepest increase),
then step in the OPPOSITE direction.

REAL EXAMPLE:
  You are lost in fog on a mountainside and want to find the valley.
  Strategy: feel the slope under your feet → step downhill → repeat.
  That IS gradient descent. The gradient is the slope. The learning rate
  is how big each step is.

  Too large step: you overshoot the valley and end up on the other side.
  Too small step: you barely move. Takes forever to converge.

CHAIN RULE = BACKPROPAGATION:
  A neural net has 100 layers. To update layer 1's weights, we need:
  d(loss)/d(W1) = d(loss)/d(W100) × d(W100)/d(W99) × ... × d(W2)/d(W1)
  This is the chain rule applied 100 times. PyTorch does this automatically.

  x = torch.tensor(3.0, requires_grad=True)
  y = x ** 3
  y.backward()          # computes dy/dx automatically
  print(x.grad)         # 27.0  (d(x^3)/dx = 3x^2, at x=3: 27)

🎥 Gradient descent visualised (3Blue1Brown): https://www.youtube.com/watch?v=IHZwWFHWa-w

━━━ 3. STATISTICS — HOW TO EVALUATE ━━━

REAL EXAMPLE (famous mistake):
  A cancer detection model achieved 99% accuracy on a dataset.
  The data had 99% non-cancer images and 1% cancer images.
  The model learned to predict "no cancer" for everything — and got 99% accuracy!
  This is why accuracy alone is misleading. Recall (catching all actual cancers)
  is the right metric here.

THINGS YOU MUST UNDERSTAND:
  Mean / standard deviation — is a feature normally distributed?
  Correlation               — which features move together?
  Probability distributions — Normal (weights), Bernoulli (classification output)
  Cross-entropy loss        = -log(predicted probability of correct class)
    → As the model gets more confident and correct, loss approaches 0.

🎥 StatQuest statistics playlist (ESSENTIAL): https://www.youtube.com/playlist?list=PLblh5JKOoLUK0FLuzwntyYI10UQFUhsY9
📚 Mathematics for ML (Cambridge, FREE): https://mml-book.github.io/`,

// ═══════════════════════════════════════════════════════════════════════════
'month2': `Month 2 goal: Build, train, and evaluate real ML models using scikit-learn.
By the end you should be able to enter a Kaggle competition and reach top 40%.

━━━ WHAT IS MACHINE LEARNING? ━━━

OLD WAY (rule-based programming):
  Engineer writes: if email contains "free money" → spam
  Problem: spammers adapt. You need 10,000 rules. Impossible to maintain.

ML WAY:
  Show 500,000 labelled emails (spam / not-spam) to an algorithm.
  Algorithm discovers the rules itself — including ones you'd never think of.
  New spam tactics? Add new labelled examples → retrain. Done.

━━━ INDUSTRY EXAMPLES OF CLASSICAL ML ━━━

Tabular data (scikit-learn excels here):
  • Credit scoring        — Logistic Regression + feature engineering
  • Customer churn        — Random Forest on subscription data
  • Demand forecasting    — Gradient Boosting on sales history
  • Ad click prediction   — XGBoost (used by Facebook, Google, Amazon)
  • Medical diagnosis     — Random Forest + decision tree interpretability

RULE OF THUMB:
  If your data is in a spreadsheet/CSV → try classical ML first.
  If your data is images, text, or audio → use deep learning.

━━━ WEEK-BY-WEEK BREAKDOWN ━━━

WEEK 1 — Supervised learning basics
  Linear Regression (house prices), Logistic Regression (spam/not-spam)
  Evaluation metrics: accuracy, precision, recall, F1, ROC-AUC
  Learn the scikit-learn API: fit → predict → score

WEEK 2 — Tree models + advanced
  Decision Tree, Random Forest, XGBoost/LightGBM
  Cross-validation, GridSearchCV hyperparameter tuning
  Feature importance — which inputs matter most?

WEEK 3 — Unsupervised learning
  K-Means clustering, PCA for dimensionality reduction
  Anomaly detection with Isolation Forest

WEEK 4 — Full project
  End-to-end: data → EDA → preprocessing → model → evaluate → notebook
  Target: Kaggle House Prices (top 40%) or Titanic (top 30%)

━━━ THE SCIKIT-LEARN PATTERN (memorise this) ━━━

  from sklearn.ensemble import RandomForestClassifier
  from sklearn.model_selection import train_test_split
  from sklearn.metrics import classification_report

  X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
  model = RandomForestClassifier(n_estimators=100, random_state=42)
  model.fit(X_train, y_train)
  print(classification_report(y_test, model.predict(X_test)))

EVERY sklearn algorithm works like this. Change the class, keep the API.

━━━ MONTH 2 CHECKPOINT ━━━

✓ Train a model on a real Kaggle dataset and submit predictions
✓ Explain overfitting vs underfitting with a bias-variance diagram
✓ Use cross-validation correctly (no data leakage)
✓ Get feature importance from a tree model

🎥 ML Course (Andrew Ng, free audit): https://www.coursera.org/learn/machine-learning
🎥 StatQuest ML playlist: https://www.youtube.com/playlist?list=PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF
📚 Hands-On ML (Aurélien Géron, gold standard): https://github.com/ageron/handson-ml3`,

// ═══════════════════════════════════════════════════════════════════════════
'supervised': `Training on (input, known_output) pairs to predict outputs for new inputs.
This is by far the most commercially important branch of ML — 80%+ of
deployed AI systems are some form of supervised learning.

━━━ THE CONCEPT ━━━

ANALOGY: Like studying with an answer key. The model sees 10,000 examples
of "question → correct answer", learns the pattern, then answers new questions.

The "question" = feature vector X.
The "correct answer" = label y.
The "learning" = adjusting model parameters to minimise prediction error.

━━━ INDUSTRY REAL-WORLD EXAMPLES ━━━

EMAIL SPAM DETECTION (Gmail):
  X = word frequencies, sender reputation, email metadata (100+ features)
  y = spam (1) or not-spam (0)
  Model: Logistic Regression + Naive Bayes
  Result: Gmail blocks 100M+ spam emails/day

CREDIT RISK SCORING (banks):
  X = age, income, debt ratio, payment history, loan amount
  y = will default (1) or not (0)
  Model: Gradient Boosted Trees (XGBoost)
  Impact: determines if you get a loan and at what interest rate

MEDICAL IMAGING (radiology AI):
  X = chest X-ray pixel array (1024×1024 image)
  y = has pneumonia (1) or not (0)
  Model: Fine-tuned DenseNet CNN
  Result: 94% accuracy, comparable to senior radiologist

UBER SURGE PRICING:
  X = time of day, weather, location, events nearby, historical demand
  y = expected demand multiplier (1.0, 1.5, 2.0×...)
  Model: Gradient Boosting Regressor
  Impact: real-time price updates every few minutes

━━━ TWO TASK TYPES ━━━

REGRESSION — predict a continuous number:
  House price prediction: X = [bedrooms, sqft, location] → y = $450,000
  Stock price forecasting: X = [historical prices, volume] → y = tomorrow's price
  Temperature forecasting: X = [pressure, humidity, season] → y = 23.4°C

CLASSIFICATION — predict a category:
  Spam detection: X = email features → y = spam or not-spam
  Disease diagnosis: X = symptoms + tests → y = disease A, B, or C
  Handwriting recognition: X = image → y = digit 0-9

━━━ THE UNIVERSAL WORKFLOW ━━━

  1. Collect labelled data: (X, y) pairs
  2. EDA: understand the data, check for issues
  3. Preprocess: handle missing values, encode categoricals, scale
  4. Split: 80% train / 20% test
  5. Train: model.fit(X_train, y_train)
  6. Evaluate: model.score(X_test, y_test)
  7. Tune: GridSearchCV for hyperparameters
  8. Deploy: wrap in API

  from sklearn.model_selection import train_test_split
  X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

━━━ SCIKIT-LEARN ALGORITHM CHOICE GUIDE ━━━

  Problem Type     Small Data (<10K)           Large Data (>100K)
  Regression       Linear/Ridge Regression     XGBoost/LightGBM
  Classification   Logistic Regression / SVM   Random Forest / XGBoost
  Any tabular      Random Forest (always try!) LightGBM (fastest)

RULE: Always establish a simple baseline first (Logistic Regression or Linear Regression).
If the baseline is already good enough, you're done. Complexity adds cost.

🎥 Andrew Ng Supervised Learning: https://www.youtube.com/watch?v=jGwO_UgTS7I
🎥 StatQuest classification playlist: https://www.youtube.com/playlist?list=PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF`,

// ═══════════════════════════════════════════════════════════════════════════
'unsupervised': `Find hidden patterns in data WITHOUT labelled outputs.
No correct answer to learn from — the algorithm discovers structure on its own.

━━━ WHY UNSUPERVISED LEARNING? ━━━

Labelling data is expensive and slow:
  ImageNet (1.4M labelled images) took 25,000 workers 2.5 years to label.
  For most real-world data, labels simply do not exist.

Unsupervised learning extracts value from the 99.9% of data that has no labels.

━━━ REAL-WORLD INDUSTRY EXAMPLES ━━━

CUSTOMER SEGMENTATION (Spotify, Netflix):
  No one tells Spotify "this user is a jazz fan".
  K-Means clusters users by listening behaviour into groups:
  Cluster 1 = "late-night hip-hop"  Cluster 2 = "morning workout EDM"
  Each cluster gets different recommendations.
  RESULT: Spotify Discover Weekly — 40M+ users every Monday.

ANOMALY DETECTION (banks, cybersecurity):
  No one labels every fraudulent transaction in advance.
  Isolation Forest flags transactions that are statistically "weird":
  Normal: purchase in your city, usual amount, usual time.
  Anomaly: purchase in Brazil at 3am for 10× usual amount.
  This catches fraud patterns that humans did not define.

TOPIC MODELLING (news, research):
  Feed 100,000 news articles to LDA with no labels.
  It discovers topics: "politics", "sports", "technology", "health".
  The New York Times uses this to auto-tag articles and recommend content.

DIMENSIONALITY REDUCTION (genomics, drug discovery):
  A patient gene expression profile: 20,000 features.
  PCA reduces to 50 dimensions that capture 95% of variance.
  Downstream ML models train 400× faster on the compressed data.

ANOMALY DETECTION IN MANUFACTURING (Tesla, BMW):
  Sensors on a factory robot generate 1000 readings/second.
  No labels for "normal vs faulty" operation.
  Autoencoder learns to reconstruct normal patterns.
  When reconstruction error is high → something is wrong → stop line.

━━━ MAIN ALGORITHMS ━━━

CLUSTERING (group similar points):
  K-Means           — fast, works for spherical clusters
  DBSCAN            — finds arbitrary shapes, detects outliers automatically
  Hierarchical      — builds a tree (dendrogram), no K needed
  Gaussian Mixture  — soft probabilistic assignments

DIMENSIONALITY REDUCTION (compress data):
  PCA               — linear compression, interpretable components
  t-SNE             — 2D/3D visualisation, shows cluster structure beautifully
  UMAP              — faster than t-SNE, preserves more global structure
  Autoencoders      — neural network compression, non-linear

ANOMALY DETECTION:
  Isolation Forest  — isolates anomalies using random splits (very fast)
  One-Class SVM     — learns the "normal" boundary
  Autoencoder       — high reconstruction error = anomaly

━━━ CODE EXAMPLES ━━━

  from sklearn.cluster import KMeans, DBSCAN
  from sklearn.decomposition import PCA
  from sklearn.ensemble import IsolationForest
  import matplotlib.pyplot as plt

  # K-Means
  km = KMeans(n_clusters=3, n_init=10, random_state=42)
  labels = km.fit_predict(X)

  # PCA → 2D for visualisation
  pca = PCA(n_components=2)
  X_2d = pca.fit_transform(X)
  plt.scatter(X_2d[:,0], X_2d[:,1], c=labels)

  # Anomaly detection
  iso = IsolationForest(contamination=0.05)   # 5% of data expected anomalous
  preds = iso.fit_predict(X)    # -1 = anomaly, +1 = normal

━━━ WHEN TO USE UNSUPERVISED vs SUPERVISED ━━━

  Use SUPERVISED when: you have labels and a clear prediction task.
  Use UNSUPERVISED when:
    - You want to understand your data before modelling
    - Labels don't exist or are too expensive to create
    - You need to compress high-dimensional data
    - You want to detect unusual patterns automatically

🎥 Unsupervised Learning intro (StatQuest): https://www.youtube.com/watch?v=eN0wFzBA4Sc
🎥 K-Means explained (StatQuest): https://www.youtube.com/watch?v=4b5d3muPQmA
🎥 PCA explained (StatQuest): https://www.youtube.com/watch?v=FgakZw6K1QQ`,

// ═══════════════════════════════════════════════════════════════════════════
'month3': `Month 3 goal: Build neural networks from scratch. Train a CNN to classify images.
Understand transformers well enough to use HuggingFace models.
By month end, you should be able to fine-tune a pre-trained model on your own data.

━━━ THE DEEP LEARNING REVOLUTION ━━━

2012: AlexNet (a CNN) wins ImageNet by a huge margin.
  Previous year's winner (hand-crafted features): 26% error rate.
  AlexNet (learned features): 15% error rate.
  This 1 paper started the entire modern AI industry.

Since 2012:
  2015: ResNet — 152-layer CNN, surpasses human-level on ImageNet (3.6% vs 5%)
  2017: Transformer — "Attention Is All You Need". Replaces RNNs for NLP.
  2018: BERT — fine-tune one model for any NLP task. Language understanding.
  2020: GPT-3 — 175B params. Writes essays, code, poetry.
  2022: ChatGPT — 100M users in 2 months. Fastest growing app in history.
  2024: GPT-4o, Claude 3.5 — multimodal, near-human across all benchmarks.

━━━ WEEK-BY-WEEK BREAKDOWN ━━━

WEEK 1 — Neural Network Fundamentals
  Neurons, layers, activation functions, loss functions, backpropagation
  Implement a 2-layer network from scratch in NumPy
  Then build the same thing in PyTorch (5× less code)

WEEK 2 — PyTorch Framework
  Tensors, autograd, nn.Module, DataLoader, training loop
  Classify MNIST (handwritten digits) with an MLP — target: 97%+ accuracy

WEEK 3 — Convolutional Neural Networks
  Convolution operation, pooling, feature maps, skip connections
  Transfer learning with ResNet-18 on dogs vs cats — target: 95%+
  Fine-tune vs feature extraction (understand the difference)

WEEK 4 — Sequence Models + Transformers
  RNN, LSTM (for time series and text)
  Self-attention mechanism, Transformer architecture
  Use HuggingFace pipeline() for your first LLM inference

━━━ WHY DEEP LEARNING NOW? ━━━

Three factors came together:
  1. DATA — ImageNet, Common Crawl, BookCorpus, web text (internet-scale)
  2. COMPUTE — GPUs are 1000× faster than CPUs for matrix multiply
  3. ALGORITHMS — ReLU, batch norm, dropout, residual connections

━━━ REAL EXAMPLES OF WHAT YOU'LL BUILD ━━━

  Week 2: MNIST classifier — 99% accuracy on handwritten digits
  Week 3: Dog/cat classifier with transfer learning — 95%+ with 100 images
  Week 4: Sentiment analysis — fine-tune BERT on movie reviews
  Bonus: Run Stable Diffusion locally to generate images from text

━━━ MONTH 3 CHECKPOINT ━━━

✓ Write the PyTorch training loop from memory (no googling)
✓ Explain what a convolution layer does to an image
✓ Use a pre-trained ResNet50 for transfer learning on a custom dataset
✓ Use HuggingFace pipeline for classification and text generation

🎥 Neural Networks from scratch (Karpathy, ESSENTIAL): https://www.youtube.com/watch?v=VMj-3S1tku0
🎥 Fast.ai Practical Deep Learning (code-first, best course): https://course.fast.ai/
📚 Learn PyTorch (free, interactive): https://www.learnpytorch.io/
📚 Dive into Deep Learning: https://d2l.ai/`,

// ═══════════════════════════════════════════════════════════════════════════
'month4': `Month 4 goal: Go deep in one specialisation AND deploy a real working model.
By month end you should have a live demo on the internet you can show in interviews.

━━━ CHOOSE YOUR SPECIALISATION ━━━

TRACK A — NLP & LLMs (if you prefer language, chatbots, text):
  Week 1: HuggingFace transformers + fine-tuning BERT on classification
  Week 2: LLMs — LoRA fine-tuning, prompt engineering, RAG with LangChain
  Week 3: FastAPI to serve your NLP model as a REST API
  Week 4: Capstone — build a document Q&A chatbot over your own PDFs

TRACK B — Computer Vision (if you prefer images, video, robotics):
  Week 1: Object detection with YOLOv8 on custom dataset
  Week 2: Image segmentation (U-Net for medical or satellite images)
  Week 3: OpenCV for real-time inference on webcam
  Week 4: Capstone — build a real-time plant disease detector

TRACK C — MLOps (if you want production/infrastructure):
  Week 1: FastAPI + Docker — wrap any model in a container
  Week 2: MLflow experiment tracking + model registry
  Week 3: Deploy to Render/Railway (free) or AWS SageMaker
  Week 4: Monitoring with Evidently AI for drift detection

━━━ THE DEPLOYMENT STACK ━━━

Most powerful free deployment pipeline:

  MODEL (PyTorch/HuggingFace)
    ↓
  FASTAPI (REST endpoint)
    ↓
  DOCKER (container)
    ↓
  RENDER / RAILWAY (free hosting)
    +
  GRADIO / HF SPACES (demo UI, also free)

  import gradio as gr
  def predict(image): return model(preprocess(image))
  gr.Interface(fn=predict, inputs="image", outputs="label").launch()
  → Working web demo in 10 lines of code.

━━━ REAL CAPSTONE PROJECTS THAT IMPRESS ━━━

NLP Track:
  Resume screener — input job description + resume → match score
  Medical FAQ bot — answers health questions from your document corpus (RAG)
  Code reviewer    — reviews Python/Java code, suggests improvements

CV Track:
  Plant disease detector — photo of leaf → disease + treatment advice
  Pothole detector        — YOLOv8 on dashcam video, deployed as API
  Face attendance system  — marks attendance from live camera feed

━━━ PORTFOLIO AFTER 4 MONTHS ━━━

End of month 4 you should have:
  ✓ GitHub repo with 3–5 well-documented projects
  ✓ At least 1 deployed live demo (HuggingFace Spaces is free)
  ✓ 1 Kaggle competition in top 40%
  ✓ Can answer: "walk me through an ML project end-to-end" in an interview

━━━ SALARY CONTEXT ━━━

India 2025 ML engineer salaries:
  Fresher (0-1 yr): 8–20 LPA (Google, Amazon, Microsoft: 25–40 LPA)
  2–3 years:        20–45 LPA
  Senior (5+ yrs):  50–100+ LPA

4 months of focused learning puts you in fresher territory.
A strong capstone project is your differentiator.

🎥 HuggingFace NLP Course (FREE, best for NLP track): https://huggingface.co/course/
🎥 YOLOv8 full tutorial: https://www.youtube.com/watch?v=wuZtUMEiKWY
🛠️ FastAPI docs: https://fastapi.tiangolo.com/
📚 Made With ML (MLOps): https://madewithml.com/`,

// ═══════════════════════════════════════════════════════════════════════════
'nn-basics': `Neural networks are the foundation of all deep learning.
Understanding them deeply — not just calling model.fit() — is what separates
engineers who can debug and improve models from those who cannot.

━━━ HOW DOES A SINGLE NEURON WORK? ━━━

BIOLOGY ANALOGY:
  A real neuron fires when enough input signals accumulate.
  An artificial neuron computes a weighted sum, then applies a threshold.

MATH:
  z = w1*x1 + w2*x2 + w3*x3 + b    (weighted sum + bias)
  output = activation(z)             (non-linearity)

REAL EXAMPLE:
  A spam-detection neuron might have:
  w1=0.8 for feature "contains free money"
  w2=0.6 for feature "ALLCAPS"
  w3=-0.9 for feature "sender in contacts"
  b = -0.5  (threshold)
  If z > 0 → activation fires → spam

━━━ MULTI-LAYER NETWORKS (MLP) ━━━

Input Layer  → receives raw data (pixels, numbers, token embeddings)
Hidden Layers→ transform the data, learn features automatically
Output Layer → final prediction (class probabilities or regression value)

REAL WORLD — CHATGPT'S ARCHITECTURE (simplified):
  Input: "What is gradient descent?" (tokenised → embedding matrix)
  96 Transformer blocks (each is many multiplications + activations)
  Output layer: probability over 50,000 vocabulary tokens → pick highest → "Gradient"

The same compute pattern (W @ x + b → activation) repeats 96 times in GPT-4.

━━━ WHY ACTIVATION FUNCTIONS ARE CRITICAL ━━━

WITHOUT ACTIVATIONS:
  Layer1 = W1 @ x + b1
  Layer2 = W2 @ Layer1 + b2
  = W2 @ (W1 @ x + b1) + b2
  = (W2 @ W1) @ x + constant
  = just ONE linear transformation, no matter how many layers!

WITH ACTIVATIONS (non-linearity between layers):
  The network can learn any arbitrary function.
  This is the Universal Approximation Theorem.

ACTIVATIONS IN USE:
  ReLU(x) = max(0, x)
    Used in: almost all hidden layers of modern networks.
    Why? Simple, fast, no vanishing gradient for positive inputs.
    Real use: ResNet, VGG, GPT hidden layers.

  GELU(x) = x * Phi(x) (Gaussian Error Linear Unit)
    Used in: GPT-2, GPT-3, BERT, most modern Transformers.
    Smoother than ReLU, slightly better performance.

  Softmax: converts raw scores to probabilities that sum to 1.
    Used in: EVERY multi-class classification output layer.
    Real use: final layer of ChatGPT generating token probabilities.

━━━ LOSS FUNCTIONS ━━━

The loss tells the network "how wrong" its current prediction is.
Training = minimising the loss.

CROSS-ENTROPY LOSS (for classification):
  L = -log(predicted probability of correct class)
  If model says P(cat) = 0.95 and it IS a cat: L = -log(0.95) = 0.05  (good)
  If model says P(cat) = 0.01 and it IS a cat: L = -log(0.01) = 4.6   (very bad)

  Used in: ALL classification tasks — spam, image recognition, ChatGPT.

MSE LOSS (for regression):
  L = (prediction - actual)²
  Used in: house price prediction, stock forecasting, anomaly scoring.

━━━ BACKPROPAGATION — HOW LEARNING HAPPENS ━━━

STEP 1: Forward pass — compute prediction from input.
STEP 2: Compute loss — how wrong is the prediction?
STEP 3: Backward pass — for every weight, compute dLoss/dWeight.
STEP 4: Update — weight = weight - learning_rate × gradient.

REAL ANALOGY:
  You take an exam. You get 60% (loss = 40%).
  You look at which topics you got wrong (backward pass).
  You study more of those topics (weight update).
  Next exam you do better (loss decreases).

PyTorch does this automatically:
  loss.backward()        # step 3: computes all gradients
  optimizer.step()       # step 4: updates all weights

━━━ COMPLETE PYTORCH TRAINING TEMPLATE ━━━

  import torch, torch.nn as nn

  class SimpleMLP(nn.Module):
      def __init__(self):
          super().__init__()
          self.net = nn.Sequential(
              nn.Linear(784, 256), nn.ReLU(),  # 784 inputs = 28x28 MNIST pixel
              nn.Linear(256, 128), nn.ReLU(),
              nn.Linear(128, 10),              # 10 digit classes
          )
      def forward(self, x):
          return self.net(x)

  model = SimpleMLP()
  opt   = torch.optim.Adam(model.parameters(), lr=1e-3)
  loss_fn = nn.CrossEntropyLoss()

  for epoch in range(20):
      for X_batch, y_batch in train_loader:
          opt.zero_grad()                     # clear old gradients
          pred = model(X_batch)               # forward pass
          loss = loss_fn(pred, y_batch)       # compute loss
          loss.backward()                     # backpropagation
          opt.step()                          # update weights
      print(f"Epoch {epoch+1}: loss={loss.item():.4f}")

━━━ COMMON ISSUES AND FIXES ━━━

Loss not decreasing?
  → Learning rate too high: try 10× smaller (1e-3 → 1e-4)
  → Learning rate too low: loss decreases very slowly (try 10× larger)
  → Bug in training loop: check zero_grad() is called every batch

Loss decreasing on train but not on test?
  → Overfitting. Add dropout: nn.Dropout(0.3) between layers.
  → Add weight decay: Adam(lr=1e-3, weight_decay=1e-4)
  → Get more training data. Use data augmentation.

NaN loss?
  → Learning rate too high. Gradients explode.
  → Add gradient clipping: torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)

🎥 Neural Networks from scratch (Karpathy, MUST WATCH): https://www.youtube.com/watch?v=VMj-3S1tku0
🎥 3Blue1Brown Neural Networks series (4 videos): https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi
📄 Original Backprop paper (Rumelhart 1986): https://www.nature.com/articles/323533a0`,

// ═══════════════════════════════════════════════════════════════════════════
'projects': `Projects are the most important part of your AI education.
A model in a notebook is worthless. A deployed model on the internet is a portfolio.
Recruiters at Google, Amazon, and startups do NOT care about your certificates.
They care about what you have BUILT.

━━━ THE LEARNING PARADOX ━━━

WRONG APPROACH (common mistake):
  Watch course → watch another course → read book → still don't know where to start.
  This is "tutorial hell." You feel busy but you're not learning.

RIGHT APPROACH:
  Learn concept (30 min) → code it yourself immediately (1–2 hrs) → repeat.
  If you cannot reproduce it without copying, you haven't learned it.

━━━ PROJECT PROGRESSION (4 levels) ━━━

LEVEL 1 — REPRODUCE (Month 1–2):
  Reproduce a tutorial notebook step by step.
  Then close the tutorial and try again from memory.

LEVEL 2 — MODIFY (Month 2–3):
  Take an existing project and swap the dataset, add a feature, improve accuracy.
  "I took the MNIST tutorial and applied it to fashion items instead of digits."

LEVEL 3 — BUILD FROM SCRATCH (Month 3–4):
  Define a problem → find a dataset → build the full pipeline.
  No tutorial. You google individual pieces but design it yourself.

LEVEL 4 — DEPLOY AND ITERATE (Month 4+):
  Ship it. Real users. Real feedback. Fix real bugs.
  "My plant disease detector is live at huggingface.co/spaces/myname/plantscan."

━━━ THE 4 MUST-HAVE PORTFOLIO PROJECTS ━━━

PROJECT 1 — TABULAR ML (end of Month 2):
  Dataset: Kaggle House Prices or Titanic
  Model: XGBoost or LightGBM with feature engineering
  Goal: Top 40% on leaderboard
  Shows: You can handle real messy data, tune models, understand evaluation.

PROJECT 2 — IMAGE CLASSIFICATION (end of Month 3):
  Dataset: your choice — plant disease, chest X-rays, food-101, satellite images
  Model: ResNet-50 fine-tuned (transfer learning, only 100–500 images needed)
  Deployed: HuggingFace Spaces with Gradio interface
  Shows: CNNs, transfer learning, deployment — the full stack.

PROJECT 3 — NLP (Month 4):
  Dataset: any text classification dataset OR your own scraped data
  Model: BERT fine-tuned via HuggingFace Transformers
  Deployed: FastAPI endpoint accessible via curl/Postman
  Shows: LLMs, fine-tuning, REST API serving.

PROJECT 4 — CAPSTONE (end of Month 4):
  Original idea, non-trivial, deployed, with a GitHub README.
  This is what interviewers will ask you to walk through.
  Aim for something you personally find useful or interesting.

━━━ WHERE TO FIND DATASETS ━━━

  Kaggle datasets:              https://www.kaggle.com/datasets
  HuggingFace Datasets:         https://huggingface.co/datasets
  UC Irvine ML Repository:      https://archive.ics.uci.edu/
  Google Dataset Search:        https://datasetsearch.research.google.com/
  Papers With Code Datasets:    https://paperswithcode.com/datasets

━━━ HOW TO DOCUMENT (GitHub README template) ━━━

  # Project Name
  ## Problem Statement
  What problem does this solve? Why does it matter?
  ## Dataset
  Where is the data from? What does it contain?
  ## Approach
  What model did you choose and why? What preprocessing did you do?
  ## Results
  What accuracy/metric did you achieve? Include a results table or plot.
  ## Demo
  Link to live demo (HuggingFace Spaces).
  ## How to Run
  Step-by-step instructions to reproduce results.

━━━ FREE COMPUTE FOR PROJECTS ━━━

  Google Colab:      T4 GPU, free, 12 hrs session, ideal for training
  Kaggle Notebooks:  T4/P100 GPU, 30 hrs/week, great for competitions
  HuggingFace Spaces:CPU inference, free hosting, perfect for demos

🏆 Kaggle: https://www.kaggle.com/
🤗 HuggingFace Spaces (host demos free): https://huggingface.co/spaces
📚 Papers With Code (state of the art + code): https://paperswithcode.com/
🎥 How to build an AI portfolio (Tina Huang): https://www.youtube.com/watch?v=1aXk2RViq3c`,

// ═══════════════════════════════════════════════════════════════════════════
'cv-advanced': `Computer Vision (CV) teaches machines to understand images and video.
Your phone, self-driving cars, medical scanners, and security cameras all use CV.

━━━ THE CV TASK HIERARCHY ━━━

CLASSIFICATION (what is in this image?):
  Input: image → Output: "dog" (with 93% confidence)
  Real use: Google Photos tagging, Instagram content moderation

OBJECT DETECTION (what objects are there AND where?):
  Input: image → Output: [("dog", 0.93, [x1,y1,x2,y2]), ("cat", 0.87, [...])]
  Real use: Tesla Autopilot (detect other cars, pedestrians, signs),
            Amazon Go stores (detect which products you pick up)

SEMANTIC SEGMENTATION (label every single pixel):
  Input: image → Output: mask where each pixel = road/sky/car/building
  Real use: Waymo autonomous driving, medical imaging (tumour boundary)

INSTANCE SEGMENTATION (separate individual objects):
  Input: image → Output: separate mask per person/car/etc.
  Real use: Meta Portrait Mode, surgical robot assistance

POSE ESTIMATION (find body/face keypoints):
  Input: image → Output: [shoulder(x,y), elbow(x,y), wrist(x,y), ...]
  Real use: Nike training app (counts reps), AR filters on TikTok/Snapchat

━━━ HOW CV MODELS SEE IMAGES ━━━

A 224×224 RGB image = tensor of shape [3, 224, 224]:
  - Channel 0: Red intensity for each of 224×224 pixels
  - Channel 1: Green intensity
  - Channel 2: Blue intensity

A CNN learns filters (like a Photoshop filter) that detect patterns:
  Layer 1 filters: detect edges (horizontal, vertical, diagonal)
  Layer 2 filters: detect corners, curves, textures
  Layer 3 filters: detect eye shapes, wheel shapes, leaf shapes
  Layer 4 filters: detect faces, cars, plants (full objects)

These are LEARNED from data, not hand-coded.

━━━ KEY TOOLS ━━━

PyTorch + torchvision:
  torchvision.models → 70+ pretrained models (ResNet, EfficientNet, ViT...)
  torchvision.datasets → ImageNet, CIFAR, MNIST, CocoDetection...
  torchvision.transforms → resize, crop, normalise, augment

HuggingFace Transformers (Vision):
  ViT (Vision Transformer), CLIP, DINO, GroundingDINO for zero-shot detection

Ultralytics YOLOv8:
  3 lines to run object detection on any image or webcam feed.
  from ultralytics import YOLO; model = YOLO("yolov8n.pt"); model.predict("img.jpg")

OpenCV:
  Read/write images and video, draw boxes, apply classical filters.
  cv2.imread, cv2.VideoCapture, cv2.rectangle, cv2.putText

━━━ SUBTOPICS IN THIS SECTION ━━━

→ Object Detection     (YOLO, Faster R-CNN, DETR)
→ Image Segmentation   (U-Net, Mask R-CNN, SAM)
→ Transfer Learning    (fine-tune pretrained models on your own images)
→ OpenCV               (image processing, video, classical CV)
→ CV Metrics & Datasets (mAP, IoU, ImageNet, COCO)

━━━ REAL-WORLD STARTER PROJECT ━━━

Plant Disease Detection (doable in Week 1 of Month 4):
  Dataset: PlantVillage (54,000 images, 38 disease classes) on Kaggle
  Model: EfficientNet-B3 fine-tuned (3-5 epochs, ~30 min on Colab GPU)
  Deploy: Gradio on HuggingFace Spaces

  from ultralytics import YOLO
  # OR
  import torchvision.models as models
  model = models.efficientnet_b3(weights="IMAGENET1K_V1")
  model.classifier[1] = nn.Linear(1536, 38)    # 38 disease classes

📄 ImageNet competition history: https://image-net.org/challenges/LSVRC/
📄 AlexNet 2012 (started the revolution): https://arxiv.org/abs/1404.5997
🎥 CS231n Stanford Computer Vision (full course): https://cs231n.github.io/
🎥 YOLOv8 full course: https://www.youtube.com/watch?v=wuZtUMEiKWY`,

};

// ─── Apply updates ──────────────────────────────────────────────────────────
let updatedCount = 0;
nodes.forEach(node => {
  if (updates[node.id]) {
    node.description = updates[node.id];
    updatedCount++;
    console.log(`  ✓  Updated: ${node.text}`);
  }
});

fs.writeFileSync(dataPath, JSON.stringify(nodes, null, 2), 'utf8');
console.log(`\nDone — enriched ${updatedCount} nodes.`);
