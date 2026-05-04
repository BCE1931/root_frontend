// seed-ai-roadmap.js
// Run: node seed-ai-roadmap.js
// Requires: Spring Boot backend on http://localhost:8080

const BASE = "http://localhost:8080/api";

async function createNode(node) {
  const res = await fetch(BASE + "/nodes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(node),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} — ${text}`);
  }
  return res.json();
}

const nodes = [
  // ═══════════════════════════════════════════════════════════════════════
  // ROOT
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "root-ai",
    parentId: null,
    text: "AI Learning Roadmap",
    description: `Your complete 4-month journey into Artificial Intelligence.

WHAT IS AI?
AI = making machines perform tasks that normally require human intelligence.
It is an umbrella term that contains many sub-fields:

SUBFIELDS:
• ML  (Machine Learning)       — algorithms that learn patterns from data
• DL  (Deep Learning)          — ML with multi-layer neural networks
• NLP (Natural Language Proc.) — text, speech, language understanding
• CV  (Computer Vision)        — image and video understanding
• RL  (Reinforcement Learning) — agents that learn via reward signals
• MLOps                        — engineering: deploying & maintaining models

YOUR BACKGROUND (Java dev):
You already understand loops, collections, functions, classes — Python will
feel like a simpler Java. Most AI code is just: load data → build model →
train → evaluate → predict.

4-MONTH PLAN:
Month 1 → Python libs + Math foundations
Month 2 → Classical Machine Learning
Month 3 → Deep Learning + Neural Networks
Month 4 → Specialization (NLP / CV) + Deployment

DAILY COMMITMENT: 2–3 hours

START HERE:
🎥 3Blue1Brown "Neural Networks" series: https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi
🎥 Fast.ai Practical Deep Learning (FREE): https://course.fast.ai/
📚 Deep Learning Book (Goodfellow, FREE): https://www.deeplearningbook.org/`,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MONTH 1
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "month1",
    parentId: "root-ai",
    text: "Month 1: Python & Math Foundations",
    description: `Goal: Get production-ready with Python data science tools and internalize
the math that powers AI algorithms.

WEEK 1–2 → Python libraries (NumPy, Pandas, Matplotlib, Jupyter)
WEEK 3–4 → Math for AI (Linear Algebra, Calculus/Gradients, Statistics)

Since you know Java, Python feels lighter:
  Java:   int[] arr = new int[]{1,2,3};
  Python: arr = [1, 2, 3]

No semicolons. Indentation is syntax. Dynamic typing. Very readable.

KEY DIFFERENCE FROM JAVA:
Python is interpreted, not compiled. Lists/dicts are first-class. No need
to declare types. Jupyter lets you run one block at a time and see results
instantly — great for data exploration.

SETUP (one-time):
1. Install Miniconda: https://docs.conda.io/en/latest/miniconda.html
2. conda create -n ai python=3.11
3. conda activate ai
4. pip install numpy pandas matplotlib seaborn jupyter scikit-learn torch

FREE SHORTCUT: Use Google Colab (zero setup, free GPU):
https://colab.research.google.com

🎥 Python for Everybody (Coursera, free audit): https://www.coursera.org/specializations/python
🎥 CS50P Harvard Python (FREE): https://cs50.harvard.edu/python/`,
  },

  // ── Python Libraries ────────────────────────────────────────────────────
  {
    id: "python-libs",
    parentId: "month1",
    text: "Python Libraries for AI",
    description: `Four libraries you will use in every single AI project.

1. NumPy  — numerical arrays and math
2. Pandas — data loading, cleaning, transformation
3. Matplotlib / Seaborn — visualization
4. Jupyter — interactive notebook environment

Think of them as your Java standard library but for data science.
Master these in Week 1–2 and everything downstream becomes easier.`,
  },
  {
    id: "numpy",
    parentId: "python-libs",
    text: "NumPy — Arrays & Math",
    description: `NumPy is the foundation of all scientific Python. Every AI tensor, image,
and dataset ultimately lives in a NumPy-like array.

CORE OBJECT: ndarray — an N-dimensional array
  import numpy as np
  a = np.array([1, 2, 3])          # 1-D
  m = np.array([[1,2],[3,4]])      # 2-D (matrix)
  t = np.zeros((3, 224, 224))      # 3-D (like an image batch)

KEY OPERATIONS:
  np.dot(a, b)        # dot/matrix product — used in EVERY neural net layer
  np.mean(a)          # mean
  np.std(a)           # standard deviation
  a.reshape(2, -1)    # change shape without copying data
  a[0:3, 1:4]         # slicing (rows 0-2, cols 1-3)

BROADCASTING:
  a = np.array([1,2,3])
  a + 10              # → [11, 12, 13]  (no loop needed!)
  This is why NumPy is fast — operations run in optimised C, not Python loops.

JAVA ANALOGY:
  Java: double[][] mat = new double[3][3]; (manual loop to fill/operate)
  NumPy: mat = np.zeros((3,3)); mat * 2   (vectorised, one line)

WHY IMPORTANT FOR AI:
All neural network weights, activations, images, and text-as-numbers
are stored as NumPy arrays (or GPU tensors that mirror the same API).

PRACTICE:
  100 NumPy exercises: https://github.com/rougier/numpy-100

🎥 NumPy Full Tutorial (freeCodeCamp): https://www.youtube.com/watch?v=QUT1VHiLmmI
📚 NumPy official docs: https://numpy.org/doc/stable/user/quickstart.html`,
  },
  {
    id: "pandas",
    parentId: "python-libs",
    text: "Pandas — DataFrames",
    description: `Pandas is for loading, cleaning, and transforming tabular data. Think of it as
a programmatic Excel that can handle millions of rows.

CORE OBJECTS:
  DataFrame — 2-D labeled table (rows × columns), like a DB table
  Series    — 1-D labeled array (a single column)

LOAD DATA:
  import pandas as pd
  df = pd.read_csv("data.csv")
  df = pd.read_json("data.json")

EXPLORE:
  df.head(5)          # first 5 rows
  df.info()           # column types + nulls
  df.describe()       # stats (mean, std, min, max)
  df["age"].value_counts()

CLEAN:
  df.dropna()                  # remove rows with missing values
  df.fillna(df.mean())         # fill nulls with column mean
  df.drop_duplicates()
  df["age"] = df["age"].astype(int)

TRANSFORM:
  df["bmi"] = df["weight"] / df["height"]**2   # new feature
  df.groupby("city")["salary"].mean()           # SQL-style GROUP BY
  df.merge(other_df, on="user_id")              # SQL-style JOIN

JAVA ANALOGY:
  Comparable to reading a ResultSet from JDBC + manually building a HashMap,
  but done in 1 line with built-in stats, joins, and transforms.

🎥 Pandas Tutorial (Corey Schafer): https://www.youtube.com/watch?v=ZyhVh-qRZPA
📚 10 minutes to Pandas: https://pandas.pydata.org/docs/user_guide/10min.html`,
  },
  {
    id: "matplotlib",
    parentId: "python-libs",
    text: "Matplotlib & Seaborn — Visualization",
    description: `Visualization is not optional — you must SEE your data before modelling it.

MATPLOTLIB (low-level, flexible):
  import matplotlib.pyplot as plt
  plt.plot(x, y)          # line chart
  plt.scatter(x, y)       # scatter plot
  plt.hist(data, bins=30) # histogram
  plt.imshow(image)       # show an image
  plt.show()

SEABORN (high-level, prettier defaults):
  import seaborn as sns
  sns.heatmap(df.corr(), annot=True)    # correlation matrix
  sns.pairplot(df)                      # scatter matrix of all features
  sns.boxplot(x="class", y="age", data=df)
  sns.histplot(df["age"], kde=True)

WHEN TO USE EACH:
  Seaborn  → quick EDA, statistical plots
  Matplotlib → custom layouts, subplots, publication figures

ESSENTIAL PLOTS TO KNOW:
  • Histogram         — understand distribution of a feature
  • Scatter plot      — find correlations between two features
  • Box plot          — see outliers and quartiles
  • Heatmap           — find correlated features (drop redundant ones)
  • Loss curves       — check if your neural net is training correctly

🎥 Matplotlib Tutorial: https://www.youtube.com/watch?v=UO98lJQ3QGI
🎥 Seaborn Tutorial: https://www.youtube.com/watch?v=6GUZXDef2U0`,
  },
  {
    id: "jupyter",
    parentId: "python-libs",
    text: "Jupyter Notebooks",
    description: `Jupyter is the standard environment for AI/ML development. Code runs in cells,
output appears inline — perfect for exploratory data analysis.

RUNNING:
  jupyter notebook    # local, opens in browser
  OR use Google Colab (free, cloud, no install): https://colab.research.google.com

CELL TYPES:
  Code cell     → runs Python, shows output below
  Markdown cell → write formatted notes with headers, math (LaTeX), links

KEYBOARD SHORTCUTS (memorise these):
  Shift+Enter   → run cell, move to next
  Ctrl+Enter    → run cell, stay
  A / B         → insert cell above / below
  D D           → delete cell
  M             → convert to Markdown
  Y             → convert to Code
  Tab           → autocomplete
  Shift+Tab     → show docstring

GOOGLE COLAB BONUS:
  • Free GPU (T4) — 30 hrs / week
  • Free TPU
  • Mount Google Drive for persistent storage
  !pip install torch   (run shell commands with !)

WHY IMPORTANT:
Most ML tutorials, research reproducibility packages, and Kaggle solutions
are distributed as .ipynb notebooks. Being fluent in Jupyter is mandatory.

🎥 Jupyter Full Tutorial: https://www.youtube.com/watch?v=HW29067qVWk
💻 Google Colab: https://colab.research.google.com`,
  },

  // ── Math for AI ─────────────────────────────────────────────────────────
  {
    id: "math-ai",
    parentId: "month1",
    text: "Math for AI",
    description: `Three pillars of math that make AI work. You do NOT need to hand-compute
everything — libraries do that. But you need conceptual understanding to:
  • Read papers and understand what models actually do
  • Debug why a model is not converging
  • Choose the right algorithm for the task
  • Tune hyperparameters intelligently

THE 3 PILLARS:
1. Linear Algebra   — how data and weights are REPRESENTED
2. Calculus         — how models LEARN (gradients)
3. Statistics       — how to EVALUATE and UNDERSTAND data

GOOD NEWS:
You already know programming, so visualising these concepts in code will
feel natural. Every formula becomes a NumPy one-liner.

🎥 Math for ML playlist (3Blue1Brown): https://www.youtube.com/c/3blue1brown
📚 Mathematics for ML (free book, Cambridge): https://mml-book.github.io/`,
  },
  {
    id: "linear-algebra",
    parentId: "math-ai",
    text: "Linear Algebra",
    description: `Linear algebra is how data and model parameters are stored and transformed.
Every forward pass in a neural network is repeated matrix multiplication.

OBJECTS:
  Scalar  → single number:       5
  Vector  → 1-D array:           [1, 2, 3]   (point in 3-D space)
  Matrix  → 2-D array:           [[1,2],[3,4]]  (neural net weight layer)
  Tensor  → N-D array:           shape (32, 3, 224, 224) = batch of images

KEY OPERATIONS:
  Dot product:          a · b = a1*b1 + a2*b2 + ...
    → Result: single number (similarity between vectors)
  Matrix multiply:      C = A @ B   (@ operator in Python/NumPy)
    → Used in EVERY dense layer: output = weights @ input + bias
  Transpose:            A.T   (flip rows/cols)
  Inverse:              np.linalg.inv(A)
  Eigenvalues/vectors:  np.linalg.eig(A)  — used in PCA

CODE:
  import numpy as np
  W = np.random.randn(4, 3)   # weight matrix (4 outputs, 3 inputs)
  x = np.array([1.0, 2.0, 3.0])  # input vector
  z = W @ x                   # linear transformation → shape (4,)

INTUITION FOR NEURAL NETS:
  One layer = W @ x + b  followed by an activation function.
  Deep learning = chaining dozens of these transformations.

🎥 Essence of Linear Algebra (3Blue1Brown, BEST series): https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab
🎥 MIT 18.06 Linear Algebra (Gilbert Strang): https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/`,
  },
  {
    id: "calculus-gradients",
    parentId: "math-ai",
    text: "Calculus & Gradient Descent",
    description: `Calculus answers: how does the output change if I tweak one weight slightly?
That answer — the gradient — is how neural networks learn.

DERIVATIVE (1 variable):
  f(x) = x²  →  f'(x) = 2x
  At x=3: slope is 6. Increasing x increases output at rate 6.

PARTIAL DERIVATIVE (many variables):
  f(w1, w2) = w1² + w2²
  ∂f/∂w1 = 2w1,  ∂f/∂w2 = 2w2
  → How much does loss change if I change w1 alone?

GRADIENT:
  Vector of all partial derivatives: ∇f = [∂f/∂w1, ∂f/∂w2, ...]
  Points in the direction of STEEPEST INCREASE.
  We want to DECREASE loss, so we go opposite direction.

GRADIENT DESCENT (the learning algorithm):
  w = w - α × ∇Loss(w)
  α = learning rate (step size, e.g. 0.001)
  Repeat until loss stops decreasing.

ANALOGY:
  You are blindfolded on a hilly landscape and want the lowest point.
  Feel the slope → step downhill → repeat.
  α controls how big each step is.
    Too large α → overshoot, oscillate
    Too small α → converge too slowly

VARIANTS:
  SGD         — one sample per step (noisy but fast)
  Mini-batch  — small batch (best trade-off, most common)
  Adam        — adaptive learning rate per parameter (default choice)

CHAIN RULE = BACKPROPAGATION:
  d(f(g(x)))/dx = f'(g(x)) · g'(x)
  Applied layer by layer backwards through the network → backprop.

CODE (PyTorch autograd does this for you):
  import torch
  x = torch.tensor(3.0, requires_grad=True)
  y = x ** 2
  y.backward()
  print(x.grad)   # → tensor(6.)

🎥 Gradient Descent (3Blue1Brown): https://www.youtube.com/watch?v=IHZwWFHWa-w
🎥 Backpropagation explained (3Blue1Brown): https://www.youtube.com/watch?v=Ilg3gGewQ5U`,
  },
  {
    id: "statistics",
    parentId: "math-ai",
    text: "Statistics & Probability",
    description: `Statistics helps you understand data distributions, evaluate model uncertainty,
and correctly measure whether your model is actually improving.

DESCRIPTIVE STATISTICS:
  Mean     — average value
  Median   — middle value (robust to outliers)
  Std Dev  — spread of values around mean
  Variance — std dev squared
  Percentile, IQR — detect and handle outliers

CODE:
  import numpy as np
  data = np.array([2, 4, 4, 4, 5, 5, 7, 9])
  np.mean(data)   # 5.0
  np.std(data)    # 2.0

PROBABILITY:
  P(A)      — probability event A happens
  P(A|B)    — conditional: probability of A given B happened
  Bayes: P(A|B) = P(B|A) × P(A) / P(B)
  → Foundation of Naive Bayes classifier and Bayesian ML

DISTRIBUTIONS TO KNOW:
  Normal (Gaussian) — bell curve; weights initialised from this
  Bernoulli         — binary (0/1); used in binary classification
  Uniform           — equal probability; used in random initialisation
  Softmax output    — probability distribution over classes

FOR MODEL EVALUATION:
  Hypothesis testing  — is improvement statistically significant?
  Confidence interval — how certain is a prediction?
  p-value             — probability result occurred by chance

USEFUL IN AI FOR:
  • Choosing features (correlation analysis)
  • Detecting data drift in production
  • Calibrating model uncertainty
  • Understanding loss functions (cross-entropy = negative log-likelihood)

🎥 StatQuest Statistics Playlist (Josh Starmer, BEST): https://www.youtube.com/playlist?list=PLblh5JKOoLUK0FLuzwntyYI10UQFUhsY9
📚 Think Stats (free book): https://greenteapress.com/thinkstats2/`,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MONTH 2 — MACHINE LEARNING
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "month2",
    parentId: "root-ai",
    text: "Month 2: Machine Learning",
    description: `Goal: Understand and implement core ML algorithms using scikit-learn.

WHAT IS ML?
Instead of writing rules manually:
  Old way: if email.contains("free money") → spam
  ML way:  show 50,000 labelled emails → algorithm learns the rules itself

THREE TYPES:
  1. Supervised   — labelled data, predict output  (most common)
  2. Unsupervised — no labels, find hidden patterns
  3. Reinforcement— agent learns by trial and reward

MAIN TOOL: scikit-learn
  pip install scikit-learn
  Consistent API: model.fit(X_train, y_train) → model.predict(X_test)

WEEK PLAN:
  Week 1 → Supervised: Linear Regression, Logistic Regression
  Week 2 → Supervised: Trees, Random Forest, SVM, KNN + Evaluation
  Week 3 → Unsupervised: K-Means, PCA, DBSCAN
  Week 4 → Feature engineering + mini Kaggle project

🎥 ML Course (Andrew Ng, Coursera, free audit): https://www.coursera.org/learn/machine-learning
🎥 StatQuest ML Playlist: https://www.youtube.com/playlist?list=PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF
📚 Hands-On ML with scikit-learn (Aurélien Géron): https://github.com/ageron/handson-ml3`,
  },

  {
    id: "supervised",
    parentId: "month2",
    text: "Supervised Learning",
    description: `Training on (input, known_output) pairs to predict outputs for new inputs.

ANALOGY: Like studying with an answer key. Model sees questions + answers,
learns the mapping, then answers unseen questions.

TWO TASKS:
  Regression     — predict continuous number (house price, temperature)
  Classification — predict category (spam/not-spam, cat/dog/bird)

THE UNIVERSAL WORKFLOW:
  1. Collect labelled data: X (features), y (labels)
  2. Split: 80% train / 20% test
  3. Choose algorithm
  4. Train:    model.fit(X_train, y_train)
  5. Evaluate: model.score(X_test, y_test)
  6. Predict:  model.predict(new_X)

  from sklearn.model_selection import train_test_split
  X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

scikit-learn ALGORITHM CHEAT SHEET:
  Linear/Logistic Regression   → interpretable baseline
  Decision Tree / Random Forest→ handles non-linear, feature importance
  SVM                          → high-dim data, text classification
  KNN                          → simple, no training time

🎥 Andrew Ng Supervised Learning intro: https://www.youtube.com/watch?v=jGwO_UgTS7I`,
  },
  {
    id: "linear-reg",
    parentId: "supervised",
    text: "Linear Regression",
    description: `Predict a continuous number by fitting a line (or hyperplane) through data.

THE MODEL:
  ŷ = w₁x₁ + w₂x₂ + ... + wₙxₙ + b
  w = weights (learned), b = bias, x = input features

EXAMPLE: Predict house price
  Features: size_m2, num_bedrooms, location_score
  Output:   price in dollars

HOW IT LEARNS — minimise Mean Squared Error:
  MSE = (1/n) Σ (yᵢ - ŷᵢ)²
  Gradient descent finds w that minimises this.

CODE:
  from sklearn.linear_model import LinearRegression
  model = LinearRegression()
  model.fit(X_train, y_train)
  preds = model.predict(X_test)

  from sklearn.metrics import mean_squared_error, r2_score
  print(r2_score(y_test, preds))   # closer to 1.0 = better

EVALUATION METRICS:
  MSE  — mean squared error (penalises large errors)
  RMSE — √MSE, same units as target
  R²   — proportion of variance explained (0 to 1)

REGULARISATION (prevents overfitting):
  Ridge (L2) → penalises large weights, shrinks them towards 0
  Lasso (L1) → pushes some weights to exactly 0 (feature selection!)

  from sklearn.linear_model import Ridge, Lasso
  model = Ridge(alpha=1.0)

🎥 Linear Regression (StatQuest): https://www.youtube.com/watch?v=nk2CQITm_eo
🎥 Regularisation Ridge/Lasso (StatQuest): https://www.youtube.com/watch?v=Q81RR3yKn30`,
  },
  {
    id: "logistic-reg",
    parentId: "supervised",
    text: "Logistic Regression",
    description: `Despite the name it is a CLASSIFICATION algorithm. Predicts the probability that
an input belongs to a class.

KEY IDEA:
  Linear regression output can be any number. Classification needs 0–1.
  Solution: pass through sigmoid function → squashes to (0, 1)
  σ(z) = 1 / (1 + e^(-z))
  If P(class=1) > 0.5 → predict class 1

EXAMPLE: Spam detection
  Input: word frequencies, sender reputation score
  Output: P(spam) = 0.92 → classify as SPAM

CODE:
  from sklearn.linear_model import LogisticRegression
  model = LogisticRegression()
  model.fit(X_train, y_train)
  probs = model.predict_proba(X_test)[:,1]  # probability of class 1
  preds = model.predict(X_test)

CLASSIFICATION METRICS (know these!):
  Accuracy  = (TP+TN) / total         ← misleading on imbalanced data!
  Precision = TP / (TP+FP)            ← of predicted positives, how many real?
  Recall    = TP / (TP+FN)            ← of actual positives, how many found?
  F1        = 2 × (P×R)/(P+R)         ← balance of precision & recall
  ROC-AUC   = area under ROC curve    ← overall discriminative power

  from sklearn.metrics import classification_report, roc_auc_score
  print(classification_report(y_test, preds))

MULTI-CLASS:
  LogisticRegression(multi_class="multinomial") for >2 classes.

WHEN TO USE:
  Good interpretable baseline for any classification task. Always try this
  before complex models to establish a floor.

🎥 Logistic Regression (StatQuest): https://www.youtube.com/watch?v=yIYKR4sgzI8`,
  },
  {
    id: "trees-forests",
    parentId: "supervised",
    text: "Decision Trees & Random Forests",
    description: `Decision Trees split data into branches based on feature thresholds.
Random Forests combine hundreds of trees — much more robust.

DECISION TREE:
  Root question: "Is income > 50k?"
  Left branch (Yes) → "Is age > 30?" → ...
  Right branch (No) → Predict "won't buy"

  Split criterion: choose the split that most reduces impurity
    Gini impurity (default)  OR  Information Gain (entropy)
  Max depth: limits tree size → prevents memorising training data

  from sklearn.tree import DecisionTreeClassifier
  tree = DecisionTreeClassifier(max_depth=5)

PROBLEM: single trees overfit badly. They memorise training data.

RANDOM FOREST (the fix):
  1. Sample N subsets of training data (with replacement) = bootstrapping
  2. Train one decision tree on each subset, using random feature subsets
  3. Prediction = majority vote of all trees (classification)
              or mean of all trees (regression)

  → Errors of individual trees cancel out → much better generalisation!
  → One of the best out-of-the-box algorithms available.

  from sklearn.ensemble import RandomForestClassifier
  forest = RandomForestClassifier(n_estimators=100, random_state=42)
  forest.fit(X_train, y_train)
  print(forest.feature_importances_)  # which features matter most?

GRADIENT BOOSTING (even better):
  XGBoost, LightGBM, CatBoost — train trees sequentially, each correcting
  the previous one's errors. Wins most Kaggle tabular competitions.

  pip install xgboost
  from xgboost import XGBClassifier

🎥 Decision Trees (StatQuest): https://www.youtube.com/watch?v=_L39rN6gz7Y
🎥 Random Forests (StatQuest): https://www.youtube.com/watch?v=J4Wdy0Wc_xQ
📄 Random Forests paper (Breiman 2001): https://link.springer.com/article/10.1023/A:1010933404324`,
  },
  {
    id: "svm-knn",
    parentId: "supervised",
    text: "SVM & KNN",
    description: `Two classic algorithms worth knowing.

KNN (K-Nearest Neighbors):
  "Tell me who your neighbours are and I'll tell you who you are."
  To classify a new point:
    1. Compute distance to ALL training points
    2. Find the K closest
    3. Return the majority class among those K

  K is a hyperparameter to tune:
    Small K (e.g. K=1) → complex boundary, overfits noise
    Large K            → smooth boundary, underfits
    Rule of thumb: K = √(n_samples)

  from sklearn.neighbors import KNeighborsClassifier
  knn = KNeighborsClassifier(n_neighbors=5)

  CONS: No model to save — must keep entire training set.
        Slow at prediction (O(n) per query). Bad for large datasets.

SVM (Support Vector Machine):
  Find the hyperplane (decision boundary) that MAXIMISES the margin between
  classes. Points closest to the boundary = "support vectors".

  KERNEL TRICK: if classes are not linearly separable, implicitly map data
  to higher-dimensional space where they become separable.
    Linear kernel  → for linearly separable data (text classification)
    RBF kernel     → most common, handles non-linear boundaries
    Poly kernel    → polynomial boundary

  from sklearn.svm import SVC
  svm = SVC(kernel="rbf", C=1.0)

  C parameter: trade-off between margin size and misclassification.
    High C → tries to classify all train points correctly (narrow margin)
    Low C  → allows some misclassification (wide margin, more generalisation)

  WHEN TO USE SVM: small-to-medium datasets, high-dimensional data (text),
  when you want a strong theoretical baseline.

🎥 KNN (StatQuest): https://www.youtube.com/watch?v=HVXime0nQeI
🎥 SVM (StatQuest): https://www.youtube.com/watch?v=efR1C6CvhmE`,
  },

  {
    id: "unsupervised",
    parentId: "month2",
    text: "Unsupervised Learning",
    description: `Find hidden structure in data WITHOUT labelled outputs.

WHY?
  Labelling data is expensive and slow. Most real-world data is unlabelled.
  Unsupervised methods extract value from raw data.

TWO MAIN TASKS:
  Clustering              — group similar data points together
  Dimensionality Reduction— compress data, remove redundancy, visualise

USE CASES:
  Customer segmentation     → group users by behaviour
  Anomaly detection         → find unusual network traffic
  Topic modelling           → discover themes in 10,000 documents
  Image compression         → represent an image with fewer numbers
  Feature extraction        → find useful representations for downstream ML

🎥 Unsupervised Learning intro (StatQuest): https://www.youtube.com/watch?v=eN0wFzBA4Sc`,
  },
  {
    id: "kmeans",
    parentId: "unsupervised",
    text: "K-Means Clustering",
    description: `Partition data into K clusters where each point belongs to the cluster
with the nearest centroid.

ALGORITHM:
  1. Randomly place K centroids
  2. Assign each point to nearest centroid (Euclidean distance)
  3. Move each centroid to the MEAN of its assigned points
  4. Repeat 2–3 until centroids stop moving

CODE:
  from sklearn.cluster import KMeans
  km = KMeans(n_clusters=3, random_state=42, n_init=10)
  labels = km.fit_predict(X)
  centers = km.cluster_centers_

CHOOSING K:
  Elbow Method: plot inertia (sum of squared distances to centroid) vs K.
  Look for the "elbow" — where adding more clusters gives diminishing returns.

  inertias = []
  for k in range(1, 11):
      km = KMeans(n_clusters=k, n_init=10)
      km.fit(X)
      inertias.append(km.inertia_)

LIMITATIONS:
  • Must specify K in advance
  • Assumes spherical, similarly-sized clusters
  • Sensitive to outliers
  • May converge to local minimum → run multiple times (n_init=10)

ALTERNATIVES:
  DBSCAN     → density-based, finds arbitrary shapes, auto-detects outliers
  Hierarchical → no need to specify K, builds a dendrogram
  GMM        → soft probabilistic assignments

🎥 K-Means (StatQuest): https://www.youtube.com/watch?v=4b5d3muPQmA`,
  },
  {
    id: "pca",
    parentId: "unsupervised",
    text: "PCA — Dimensionality Reduction",
    description: `PCA (Principal Component Analysis): Reduce high-dimensional data to fewer
dimensions while preserving maximum variance.

WHY?
  • 1000-feature dataset → slow training, curse of dimensionality
  • Many features are correlated → redundant information
  • 2D/3D reduction → visualise clusters and structure

INTUITION:
  Imagine a 3-D cloud of points shaped like a flat pancake.
  PCA finds the 2-D plane the pancake lies on and projects everything onto it.
  You lose the tiny "thickness" (low variance) but preserve the shape (high variance).

ALGORITHM:
  1. Centre data (subtract mean)
  2. Compute covariance matrix
  3. Compute eigenvectors (principal components = new axes)
  4. Sort by eigenvalue (explained variance)
  5. Project data onto top N components

CODE:
  from sklearn.decomposition import PCA
  pca = PCA(n_components=2)           # keep 2 dimensions for plotting
  X_2d = pca.fit_transform(X)

  pca = PCA(n_components=0.95)        # keep enough to explain 95% variance
  X_reduced = pca.fit_transform(X)

  print(pca.explained_variance_ratio_) # how much variance each PC captures

USES IN AI:
  • Visualise clusters: reduce to 2D → scatter plot
  • Speed up training: 1000 features → 50 PCs
  • Noise removal: low-variance PCs often capture noise
  • Face recognition: "eigenfaces" = PCA on face images

t-SNE / UMAP (better for visualisation):
  Non-linear dimensionality reduction, much better at separating clusters visually.
  Use t-SNE/UMAP for 2D visualisation, PCA for preprocessing before ML.

🎥 PCA (StatQuest, clear explanation): https://www.youtube.com/watch?v=FgakZw6K1QQ
🎥 t-SNE (StatQuest): https://www.youtube.com/watch?v=NEaUSP4YerM`,
  },

  {
    id: "model-evaluation",
    parentId: "month2",
    text: "Model Evaluation & Tuning",
    description: `How to honestly measure model performance and systematically improve it.

THE CORE PROBLEM: Overfitting.
  A model that memorises training data will fail on new data.
  Need to measure performance on UNSEEN data.

DATA SPLITS:
  Training set   (60–70%) → model learns from this
  Validation set (10–20%) → tune hyperparameters on this
  Test set       (20%)    → final honest evaluation, NEVER touch during dev

  from sklearn.model_selection import train_test_split

CROSS-VALIDATION (more reliable):
  K-Fold: divide data into K equal folds.
  Train K times, each time using a different fold as validation.
  Final score = mean of K scores.

  from sklearn.model_selection import cross_val_score
  scores = cross_val_score(model, X, y, cv=5, scoring="accuracy")
  print(f"{scores.mean():.3f} ± {scores.std():.3f}")

OVERFITTING vs UNDERFITTING:
  Underfitting (High Bias)
    → High error on BOTH train and test
    → Model is too simple
    → Fix: more features, more complex model, train longer

  Overfitting (High Variance)
    → Low train error, HIGH test error
    → Model memorised training data
    → Fix: regularisation, more data, simpler model, dropout (in DL)

HYPERPARAMETER TUNING:
  Hyperparameters are settings you choose (not learned):
    e.g. learning_rate, n_estimators, max_depth, C, kernel

  Grid Search: try every combination
    from sklearn.model_selection import GridSearchCV
    grid = GridSearchCV(SVC(), {"C": [0.1,1,10], "kernel": ["rbf","linear"]})

  Random Search: try random combinations (faster for large spaces)
    from sklearn.model_selection import RandomizedSearchCV

FEATURE ENGINEERING:
  Raw data rarely gives the best model. Transform features:
    • Log transform skewed numeric features
    • One-hot encode categorical features
    • Create interaction features (col_A × col_B)
    • Normalise: (x - mean) / std  or  MinMaxScaler
    • Drop highly correlated features

  from sklearn.preprocessing import StandardScaler, OneHotEncoder
  from sklearn.pipeline import Pipeline

🎥 Bias-Variance Tradeoff (StatQuest): https://www.youtube.com/watch?v=EuBBz3bI-aA
🎥 Cross-validation (StatQuest): https://www.youtube.com/watch?v=fSytzGwwBVw`,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MONTH 3 — DEEP LEARNING
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "month3",
    parentId: "root-ai",
    text: "Month 3: Deep Learning",
    description: `Goal: Understand neural networks and build image/sequence models in PyTorch.

WHAT IS DEEP LEARNING?
ML with many-layered neural networks that automatically learn hierarchical
feature representations.

WHY DEEP LEARNING IS REVOLUTIONARY:
  • No manual feature engineering — learns features from raw data
  • State-of-the-art on: images, text, audio, video, games, protein folding
  • Powers: ChatGPT, DALL-E, AlphaFold, Tesla Autopilot, Google Translate

WHY "DEEP"?
  Each layer learns increasingly abstract features from images:
    Layer 1 → edges, colours
    Layer 2 → shapes, textures
    Layer 3 → object parts (ears, wheels)
    Layer 4 → whole objects (dog, car)

FRAMEWORK: PyTorch (recommended)
  • Intuitive, Pythonic, dynamic computation graph
  • Used by OpenAI, Meta, Google DeepMind, academic research
  • pip install torch torchvision

WEEK PLAN:
  Week 1 → Neural network fundamentals + backprop
  Week 2 → PyTorch framework, training loop
  Week 3 → CNNs for images
  Week 4 → RNNs, LSTMs, intro to Transformers

🎥 Deep Learning Specialisation (Andrew Ng, Coursera): https://www.coursera.org/specializations/deep-learning
🎥 Fast.ai Practical Deep Learning (hands-on, FREE): https://course.fast.ai/
📚 Dive into Deep Learning (code-first, FREE): https://d2l.ai/`,
  },
  {
    id: "nn-basics",
    parentId: "month3",
    text: "Neural Network Fundamentals",
    description: `The building blocks that all deep learning models share.

SINGLE NEURON (Perceptron):
  z = w₁x₁ + w₂x₂ + ... + wₙxₙ + b   (weighted sum + bias)
  output = activation(z)

MULTI-LAYER PERCEPTRON (MLP):
  Input Layer → Hidden Layer(s) → Output Layer
  Each layer: y = activation(W @ x + b)

ACTIVATION FUNCTIONS (non-linearity is essential!):
  Without activations, stacking layers = still just one linear transform.

  ReLU(x)    = max(0, x)          ← most common hidden layer activation
  Sigmoid(x) = 1/(1+e^-x)         ← output for binary classification
  Softmax(z) = eᶻⁱ / Σeᶻʲ        ← output for multi-class (sums to 1)
  Tanh(x)    = (eˣ-e^-x)/(eˣ+e^-x) ← similar to sigmoid but -1 to 1

LOSS FUNCTIONS:
  MSE (regression):     L = (1/n) Σ (ŷ - y)²
  Cross-entropy (class): L = -Σ y·log(ŷ)

BACKPROPAGATION:
  1. Forward pass  → compute prediction ŷ
  2. Compute loss  → how wrong is ŷ?
  3. Backward pass → chain rule, compute ∂L/∂w for every weight
  4. Update weights → w = w - α · ∂L/∂w

In PyTorch: loss.backward() runs step 3 automatically.

TRAINING LOOP TEMPLATE:
  for epoch in range(100):
      optimizer.zero_grad()          # clear old gradients
      output = model(X)              # forward pass
      loss = criterion(output, y)    # compute loss
      loss.backward()                # backpropagation
      optimizer.step()               # update weights

🎥 Neural Networks from Scratch (Karpathy, MUST WATCH): https://www.youtube.com/watch?v=VMj-3S1tku0
🎥 3Blue1Brown Neural Networks (intuition): https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi
📄 Original Backprop paper (Rumelhart 1986): https://www.nature.com/articles/323533a0`,
  },
  {
    id: "pytorch",
    parentId: "month3",
    text: "PyTorch Framework",
    description: `PyTorch is the standard framework for deep learning research and industry.

CORE CONCEPTS:

1. Tensor (like NumPy array but GPU-accelerated):
   import torch
   x = torch.tensor([[1.0, 2.0], [3.0, 4.0]])
   x = x.cuda()                  # move to GPU
   x = x.to("mps")               # Apple Silicon GPU

2. autograd (automatic differentiation):
   x = torch.tensor(3.0, requires_grad=True)
   y = x ** 2
   y.backward()
   print(x.grad)                  # 6.0 — no manual calculus!

3. nn.Module (base class for all models):
   import torch.nn as nn
   class MyModel(nn.Module):
       def __init__(self):
           super().__init__()
           self.fc1 = nn.Linear(784, 128)
           self.fc2 = nn.Linear(128, 10)
       def forward(self, x):
           x = torch.relu(self.fc1(x))
           return self.fc2(x)

4. DataLoader (batched, shuffled data):
   from torch.utils.data import DataLoader, TensorDataset
   ds = TensorDataset(X, y)
   loader = DataLoader(ds, batch_size=32, shuffle=True)

5. Optimiser & Loss:
   optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
   criterion = nn.CrossEntropyLoss()

COMPLETE TRAINING LOOP:
   model = MyModel()
   for epoch in range(20):
       for xb, yb in loader:
           optimizer.zero_grad()
           pred = model(xb)
           loss = criterion(pred, yb)
           loss.backward()
           optimizer.step()

SAVE / LOAD MODEL:
   torch.save(model.state_dict(), "model.pt")
   model.load_state_dict(torch.load("model.pt"))

🎥 PyTorch for Beginners (freeCodeCamp, 4 hrs): https://www.youtube.com/watch?v=V_xro1bcAuA
📚 Learn PyTorch (code-first book, FREE): https://www.learnpytorch.io/
📚 PyTorch official tutorials: https://pytorch.org/tutorials/`,
  },
  {
    id: "cnn",
    parentId: "month3",
    text: "CNNs — Computer Vision",
    description: `Convolutional Neural Networks: the standard architecture for images.

WHY NOT MLP FOR IMAGES?
  224×224 RGB image = 150,528 inputs
  MLP first hidden layer (1024 units) = 154M parameters just in layer 1!
  Also, MLPs treat pixel (0,0) and pixel (0,1) as completely unrelated.

CONVOLUTIONAL LAYER:
  A small filter (kernel), e.g. 3×3, slides across the image.
  At each position: element-wise multiply + sum → single output value.
  This detects: edges, corners, textures — the same filter works everywhere!
  Parameter sharing: one 3×3 filter = 9 params instead of 150,528.

POOLING LAYER:
  Max Pooling: take max value in each 2×2 region.
  Halves width and height, keeps most important signal.
  Provides translation invariance ("cat in top-left" = same as "cat in top-right").

TYPICAL CNN BLOCK:
  Input → [Conv → ReLU → MaxPool] × N → Flatten → Dense → Softmax

CODE:
  import torch.nn as nn
  class SmallCNN(nn.Module):
      def __init__(self):
          super().__init__()
          self.conv = nn.Sequential(
              nn.Conv2d(3, 32, kernel_size=3, padding=1), nn.ReLU(),
              nn.MaxPool2d(2),
              nn.Conv2d(32, 64, kernel_size=3, padding=1), nn.ReLU(),
              nn.MaxPool2d(2),
          )
          self.head = nn.Linear(64*56*56, 10)
      def forward(self, x):
          x = self.conv(x).flatten(1)
          return self.head(x)

FAMOUS ARCHITECTURES (just use via torchvision.models):
  LeNet-5    (1998) — first practical CNN
  AlexNet    (2012) — ImageNet breakthrough, launched the DL revolution
  VGG16/19   (2014) — very deep, simple repeated blocks
  ResNet     (2015) — skip connections solve vanishing gradient, 152 layers!
  EfficientNet(2019)— scales depth/width/resolution together optimally

TRANSFER LEARNING (CRITICAL):
  Pre-train on ImageNet (1.2M images, 1000 classes) → fine-tune on YOUR data.
  Works even with only 100–500 training images!

  import torchvision.models as models
  model = models.resnet50(weights="IMAGENET1K_V1")
  model.fc = nn.Linear(2048, num_your_classes)  # replace final layer
  # Only train the final layer first, then unfreeze all layers

🎥 CNNs (Andrej Karpathy Stanford CS231n): https://www.youtube.com/watch?v=LxfUGhug-iQ
📄 AlexNet paper: https://papers.nips.cc/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf
📄 ResNet paper: https://arxiv.org/abs/1512.03385`,
  },
  {
    id: "rnn-lstm",
    parentId: "month3",
    text: "RNNs & LSTMs",
    description: `Recurrent Neural Networks for sequential data (text, time series, audio).

WHY RNN?
  MLPs and CNNs treat each input independently.
  In language: "I love AI" — meaning of "love" depends on context.
  RNNs maintain a hidden state that carries information across time steps.

RNN EQUATION:
  h_t = tanh(W_h · h_{t-1} + W_x · x_t + b)
  h_t  = hidden state at step t (the "memory")
  x_t  = input at step t
  Same weights W used at every step → parameter sharing across time.

VANISHING GRADIENT PROBLEM:
  Gradients shrink exponentially when backpropagating through many time steps.
  Words from early in a long sentence effectively "disappear" from learning.

LSTM (Long Short-Term Memory) — the solution:
  Has a CELL STATE (long-term memory) + HIDDEN STATE (short-term working memory).
  Three gates control the flow of information:
    Forget gate  → decides what to erase from cell state
    Input gate   → decides what new info to add
    Output gate  → decides what to output as hidden state

  This gating mechanism allows LSTMs to learn what to remember across 1000+ steps.

GRU (Gated Recurrent Unit):
  Simplified LSTM: 2 gates instead of 3. Slightly faster, often similar quality.

CODE (PyTorch):
  lstm = nn.LSTM(input_size=100, hidden_size=256, num_layers=2, batch_first=True)
  output, (h_n, c_n) = lstm(x)   # x: (batch, seq_len, input_size)

APPLICATIONS:
  • Text generation
  • Sentiment classification
  • Time series forecasting (still better than Transformers for short sequences)
  • Speech recognition
  • Music generation

NOTE: For most NLP tasks, Transformers (next node) have surpassed LSTMs.
But LSTMs remain the go-to for univariate time series.

🎥 LSTM Illustrated (Chris Olah blog, MUST READ): https://colah.github.io/posts/2015-08-Understanding-LSTMs/
🎥 RNN (Andrej Karpathy): https://www.youtube.com/watch?v=iX5V1WpxxkY
📄 Original LSTM paper (Hochreiter & Schmidhuber, 1997): https://www.bioinf.jku.at/publications/older/2604.pdf`,
  },
  {
    id: "transformers",
    parentId: "month3",
    text: "Transformers & Attention",
    description: `Transformers (2017) replaced RNNs for almost all NLP tasks and later for vision.
They power GPT-4, Claude, DALL-E, Whisper, and AlphaFold.

THE PROBLEM WITH RNNs:
  • Sequential processing → can't parallelise → slow
  • Long-range dependencies still fail even with LSTM

ATTENTION MECHANISM (key insight):
  For each position, compute how much it should "attend" to every other position.
  No more recurrence — everything is computed in parallel.

  Attention(Q, K, V) = softmax(QKᵀ / √d_k) · V
  Q = Query, K = Key, V = Value  (all are linear transforms of the input)

SELF-ATTENTION INTUITION:
  Sentence: "The animal didn't cross the street because it was too tired."
  What does "it" refer to?
  Self-attention: "it" attends strongly to "animal" → resolves coreference!

MULTI-HEAD ATTENTION:
  Run attention H times in parallel with different learned projections.
  Each head focuses on different relationships (syntax, semantics, coreference).
  Concatenate all heads → linear projection.

POSITIONAL ENCODING:
  Attention has no concept of order. Add sinusoidal position vectors so
  the model knows which position each token occupies.

TRANSFORMER BLOCK:
  Input → Multi-Head Self-Attention → Add & Norm → FFN → Add & Norm

ENCODER vs DECODER:
  Encoder (BERT)   → reads full input, great for understanding tasks
  Decoder (GPT)    → generates one token at a time (autoregressive)
  Enc-Dec (T5/BART)→ seq2seq: translation, summarisation

FAMOUS MODELS:
  BERT (2018)   → bidirectional encoder, classification, QA
  GPT-2/3/4     → autoregressive decoder, text generation
  T5            → "text-to-text transfer transformer"
  ViT (2020)    → Vision Transformer: patches of image as tokens!
  Whisper       → speech recognition
  DALL-E 2/3    → text → image generation

🎥 Transformer paper explained (Yannic Kilcher): https://www.youtube.com/watch?v=iDulhoQ2pro
📖 The Illustrated Transformer (Jay Alammar, MUST READ): https://jalammar.github.io/illustrated-transformer/
📄 Attention Is All You Need (Vaswani et al. 2017): https://arxiv.org/abs/1706.03762
🎥 Let's build GPT from scratch (Karpathy): https://www.youtube.com/watch?v=kCc8FmEb1nY`,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MONTH 4 — SPECIALISATIONS
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "month4",
    parentId: "root-ai",
    text: "Month 4: Specialisations & Deployment",
    description: `Goal: Go deep in one specialisation AND learn to ship models to production.

CHOOSE YOUR FOCUS (pick one to go deep, skim others):
  NLP & LLMs       → chatbots, text analysis, document AI
  Computer Vision  → object detection, medical imaging, robotics
  MLOps            → deploying models, pipelines, monitoring

WHY DEPLOYMENT MATTERS:
  A model that stays in a Jupyter notebook is useless.
  Month 4 teaches you to wrap a model in an API, containerise it,
  and serve real users.

WEEK PLAN:
  Week 1 → HuggingFace + NLP deep dive
  Week 2 → Computer Vision advanced (YOLO, segmentation)
  Week 3 → FastAPI model serving + Docker basics
  Week 4 → Capstone project end-to-end

TOOLS:
  HuggingFace Transformers → pre-trained NLP/vision models
  FastAPI                  → build REST API for your model
  Docker                   → package model + code into container
  MLflow                   → experiment tracking
  Streamlit / Gradio       → quick demo UIs

🎥 HuggingFace NLP Course (FREE): https://huggingface.co/course/
🛠️ FastAPI: https://fastapi.tiangolo.com/
📚 Made With ML (MLOps course): https://madewithml.com/`,
  },

  {
    id: "nlp",
    parentId: "month4",
    text: "NLP & Large Language Models",
    description: `NLP: Teaching machines to read, understand, and generate human language.

NLP TASK TAXONOMY:
  Text Classification   → sentiment, spam, topic labelling
  Token Classification  → NER (extract names, places, dates from text)
  Question Answering    → given passage + question → answer span
  Summarisation         → long article → concise summary
  Translation           → English → French
  Text Generation       → autocompletion, story writing
  Conversational AI     → chatbots, assistants

THE MODERN NLP PIPELINE:
  Raw Text → Tokenisation → Embeddings → Transformer → Task Head → Output

TOKENISATION:
  Split text into tokens (sub-word units):
  "unhappiness" → ["un", "##happi", "##ness"]   (WordPiece, BERT)
  "unhappiness" → ["un", "happiness"]            (BPE, GPT)
  Handles rare words, typos, and new words gracefully.

WORD EMBEDDINGS (pre-Transformer era):
  Map words to dense vectors where semantic similarity = geometric proximity.
  king - man + woman ≈ queen   (famous Word2Vec demo)
  Word2Vec (2013), GloVe (2014), FastText (handles OOV words)

CONTEXTUAL EMBEDDINGS (Transformer era):
  Same word → different vector depending on context.
  "bank" in "river bank" ≠ "bank" in "bank account"
  BERT, GPT, RoBERTa all produce contextual embeddings.

HUGGINGFACE — the essential library:
  from transformers import pipeline

  # Sentiment analysis (3 lines!)
  clf = pipeline("sentiment-analysis")
  print(clf("I love learning AI!"))
  # → [{"label": "POSITIVE", "score": 0.9998}]

  # Named entity recognition
  ner = pipeline("ner", grouped_entities=True)

  # Text generation
  gen = pipeline("text-generation", model="gpt2")

🎥 HuggingFace NLP Course (FREE, hands-on): https://huggingface.co/course/
📖 Illustrated BERT (Jay Alammar): https://jalammar.github.io/illustrated-bert/
📄 BERT paper: https://arxiv.org/abs/1810.04805
📄 GPT-3 paper: https://arxiv.org/abs/2005.14165`,
  },
  {
    id: "llm-finetuning",
    parentId: "nlp",
    text: "LLMs & Fine-tuning",
    description: `Large Language Models (LLMs) are trained on internet-scale text to predict
the next token. They emerge with remarkable language abilities.

HOW LLMS ARE BUILT:
  Stage 1: Pre-training
    Objective: predict next token (GPT) or masked token (BERT)
    Scale: billions of tokens, billions of parameters
    Result: model "knows" language and world knowledge

  Stage 2: Supervised Fine-tuning (SFT)
    Show (instruction, ideal response) pairs
    Model learns to follow instructions

  Stage 3: RLHF (Reinforcement Learning from Human Feedback)
    Humans rank model responses → train reward model → PPO fine-tune
    Result: helpful, harmless, honest model (ChatGPT, Claude)

FINE-TUNING YOUR OWN MODEL:
  Option A: Full fine-tune — train all parameters (needs 8+ GPU VRAM)
  Option B: LoRA — only train small adapter matrices (works on laptop GPU!)
    → Inject low-rank matrices into attention layers
    → 10–100× fewer trainable parameters, similar quality

  from peft import get_peft_model, LoraConfig
  from transformers import AutoModelForCausalLM

  model = AutoModelForCausalLM.from_pretrained("mistralai/Mistral-7B-v0.1")
  config = LoraConfig(r=8, lora_alpha=16, target_modules=["q_proj","v_proj"])
  model = get_peft_model(model, config)

QUANTISATION (run big models on small GPU):
  4-bit quantisation: 7B model = ~4 GB VRAM instead of 14 GB
  from transformers import BitsAndBytesConfig
  QLoRA = quantisation + LoRA — fine-tune 7B on a single 16 GB GPU!

OPEN SOURCE LLMs TO KNOW:
  LLaMA 3 (Meta)         → best open weights general model
  Mistral 7B / Mixtral   → excellent efficiency-performance ratio
  Phi-3 (Microsoft)      → small but surprisingly capable
  CodeLlama / DeepSeek   → coding specialists

RUN LOCALLY:
  Ollama: https://ollama.ai/   (one command: ollama run llama3)

RAG (Retrieval-Augmented Generation):
  Give an LLM access to your private documents at query time.
  1. Chunk + embed documents → store in vector database (Chroma, Pinecone)
  2. At query: embed question → retrieve top-K relevant chunks
  3. Prepend chunks to LLM context → answer is grounded in your data

📄 LoRA paper: https://arxiv.org/abs/2106.09685
📄 QLoRA paper: https://arxiv.org/abs/2305.14314
📄 InstructGPT / RLHF paper: https://arxiv.org/abs/2203.02155
🎥 Fine-tuning LLMs (HuggingFace PEFT): https://huggingface.co/docs/peft/`,
  },

  {
    id: "cv-advanced",
    parentId: "month4",
    text: "Computer Vision Advanced",
    description: `Beyond classification: detection, segmentation, and real-world vision systems.

TASK HIERARCHY:
  Classification     → "this image is a dog"
  Object Detection   → "there's a dog at [x,y,w,h] and a cat at [x2,y2,w2,h2]"
  Semantic Segment.  → label every single pixel (road/sky/car/person)
  Instance Segment.  → separate individual instances of the same class
  Pose Estimation    → locate body keypoints (head, elbows, knees)

OBJECT DETECTION ARCHITECTURES:
  YOLO (You Only Look Once) family:
    • Single-pass detection — very fast, suitable for real-time video
    • YOLOv8 (Ultralytics) is the easiest to use today:
      from ultralytics import YOLO
      model = YOLO("yolov8n.pt")          # nano model
      results = model("image.jpg")
      results[0].show()                   # shows boxes + labels

  Faster R-CNN:
    • Two-stage: propose regions → classify each region
    • More accurate but slower than YOLO

  DETR (Detection Transformer, 2020):
    • Transformers for detection — no anchors, no NMS post-processing
    • Simpler architecture, competitive accuracy

SEGMENTATION:
  U-Net (2015): encoder-decoder with skip connections
    → Originally for medical imaging, now general purpose
    → Remarkably good results with small datasets
  Mask R-CNN: instance segmentation, extends Faster R-CNN
  SAM (Segment Anything Model, Meta 2023):
    → Zero-shot — segment ANY object given a point/box prompt
    → from segment_anything import SamPredictor

DATASETS:
  ImageNet  → 1.2M images, 1000 classes (classification benchmark)
  COCO      → 330K images, 80 classes, with detection + segmentation labels
  Pascal VOC→ classic detection benchmark
  Open Images→ 9M images, 600 classes

DATA AUGMENTATION (crucial for vision):
  from albumentations import Compose, RandomHorizontalFlip, RandomBrightnessContrast
  Augmentations artificially expand your dataset: flip, crop, rotate, colour jitter.

📄 YOLO paper: https://arxiv.org/abs/1506.02640
📄 U-Net paper: https://arxiv.org/abs/1505.04597
📄 SAM paper: https://arxiv.org/abs/2304.02643
🛠️ YOLOv8 (Ultralytics): https://github.com/ultralytics/ultralytics`,
  },

  {
    id: "mlops",
    parentId: "month4",
    text: "MLOps & Model Deployment",
    description: `MLOps bridges the gap between a model that works in a notebook and a model
that reliably serves millions of users in production.

THE GAP: 90% of ML projects never reach production.
Reasons: no API, no versioning, no monitoring, not reproducible.

STEP 1 — Experiment Tracking (MLflow):
  import mlflow
  with mlflow.start_run():
      mlflow.log_param("lr", 0.001)
      mlflow.log_param("epochs", 20)
      mlflow.log_metric("val_acc", 0.94)
      mlflow.pytorch.log_model(model, "model")
  → Compare runs in a dashboard. Reproducibility guaranteed.
  mlflow ui    (runs at http://localhost:5000)

STEP 2 — Serve as REST API (FastAPI):
  from fastapi import FastAPI
  import torch

  app = FastAPI()
  model = torch.load("model.pt"); model.eval()

  @app.post("/predict")
  async def predict(payload: dict):
      x = preprocess(payload["input"])
      with torch.no_grad():
          out = model(x)
      return {"prediction": out.tolist()}

  uvicorn app:app --host 0.0.0.0 --port 8000

STEP 3 — Containerise (Docker):
  FROM python:3.11-slim
  COPY requirements.txt .
  RUN pip install -r requirements.txt
  COPY model.pt app.py ./
  CMD ["uvicorn", "app:app", "--host", "0.0.0.0"]

  docker build -t my-model .
  docker run -p 8000:8000 my-model

STEP 4 — Deploy to Cloud:
  Render / Railway   → free tier, deploy Docker container from GitHub
  HuggingFace Spaces → deploy Gradio/Streamlit demo for free
  AWS SageMaker      → managed ML platform
  Google Vertex AI   → GCP ML platform

STEP 5 — Monitor:
  Data drift: real-world distribution shifts away from training distribution.
  Monitor: input statistics, prediction distribution, latency, error rate.
  Tools: Evidently AI (open source), Arize, WhyLabs

🛠️ MLflow: https://mlflow.org/
🛠️ FastAPI: https://fastapi.tiangolo.com/
📚 Made With ML (end-to-end MLOps): https://madewithml.com/
🎥 Deploy ML model (Krish Naik): https://www.youtube.com/watch?v=ipFUANeStYE`,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // PROJECTS
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "projects",
    parentId: "root-ai",
    text: "Projects & Practice",
    description: `Projects are the most important part of learning AI.
Theory without practice is useless. Code written, debugged, and iterated = real learning.

PROGRESSION:
  Week 1–4:  Reproduce tutorial notebooks step by step
  Week 5–8:  Modify existing projects (change dataset, add a feature)
  Week 9–12: Build original mini-projects from scratch
  Week 13–16: Capstone: full end-to-end project with deployment

PLATFORMS:
  Kaggle — datasets, competitions, free GPU (30 hrs/week), community notebooks
    Start with: "Getting Started" competitions (Titanic, House Prices, MNIST)
  Google Colab — free GPU, good for experimentation
  HuggingFace Spaces — host live demos for free (Gradio or Streamlit)
  GitHub — document everything; recruiters look here

BUILD IN PUBLIC:
  Put every project on GitHub with a clear README.
  Even a failed experiment is worth documenting — shows learning.

🏆 Kaggle: https://www.kaggle.com/
📚 Papers With Code: https://paperswithcode.com/
🤗 HuggingFace Hub: https://huggingface.co/`,
  },
  {
    id: "monthly-projects",
    parentId: "projects",
    text: "Month-by-Month Project Plan",
    description: `Concrete projects to build alongside your learning each month.

━━━━━ MONTH 1 PROJECTS (Python + Data) ━━━━━

Project 1: Titanic EDA
  Dataset: https://www.kaggle.com/c/titanic
  Goal: Load data → clean → visualise survival patterns
  Skills: Pandas, Matplotlib, Seaborn
  Deliverable: Jupyter notebook with 10+ visualisations and insights

Project 2: Personal Data Pipeline
  Goal: Write a script that loads a CSV, cleans it, and outputs summary stats
  Practice: groupby, merge, fillna, feature creation, export to new CSV

━━━━━ MONTH 2 PROJECTS (Machine Learning) ━━━━━

Project 3: Iris & Titanic Classification
  Dataset: sklearn.datasets.load_iris(), Titanic from Kaggle
  Goal: Train Logistic Regression, Decision Tree, Random Forest — compare accuracy
  Skills: scikit-learn, cross-validation, classification report

Project 4: House Price Prediction (Regression)
  Dataset: https://www.kaggle.com/c/house-prices-advanced-regression-techniques
  Goal: Feature engineer + train Ridge/Lasso/XGBoost → submit to leaderboard
  Target: Top 40% on leaderboard (achievable in a weekend)

Project 5: Customer Segmentation
  Dataset: Mall customer dataset (Kaggle)
  Goal: K-Means clustering → identify 4–5 customer segments → visualise with PCA

━━━━━ MONTH 3 PROJECTS (Deep Learning) ━━━━━

Project 6: MNIST Digit Classifier (MLP)
  Dataset: torchvision.datasets.MNIST
  Goal: Build MLP from scratch in PyTorch, achieve > 97% accuracy
  Skills: PyTorch, training loop, loss curves

Project 7: Cat vs Dog CNN Classifier
  Dataset: https://www.kaggle.com/c/dogs-vs-cats
  Goal: Train ResNet-18 with transfer learning, achieve > 95% accuracy
  Skills: CNNs, torchvision, data augmentation, transfer learning

Project 8: Sentiment Analysis with LSTM
  Dataset: IMDB movie reviews (50K reviews, positive/negative)
  Goal: Train LSTM to classify sentiment, then compare to BERT baseline

━━━━━ MONTH 4 PROJECTS (Specialisation) ━━━━━

Project 9: Fine-tune BERT for Text Classification
  Goal: Fine-tune bert-base-uncased on a topic classification dataset
  Deploy as FastAPI endpoint → test with curl / Postman

Project 10: Real-time Object Detection with YOLOv8
  Goal: Run YOLOv8 on webcam feed → draw bounding boxes
  Skills: YOLOv8, OpenCV
  from ultralytics import YOLO; model = YOLO("yolov8n.pt"); model.predict(source=0)

🏆 Best dataset source: https://www.kaggle.com/datasets`,
  },
  {
    id: "capstone",
    parentId: "projects",
    text: "Capstone Project Ideas",
    description: `The capstone is your flagship project: full pipeline from data to deployed demo.
This is what you show in interviews and your portfolio.

CRITERIA FOR A STRONG CAPSTONE:
  ✓ Solves a real, interesting problem
  ✓ Non-trivial dataset (not just Iris/MNIST)
  ✓ Full pipeline: data → preprocess → train → evaluate → deploy
  ✓ Live demo (HuggingFace Spaces, or public API)
  ✓ GitHub with clear README, results, and architecture diagram

━━━━━ NLP CAPSTONE IDEAS ━━━━━

Resume Screener:
  Input: job description + resume PDF
  Output: relevance score + explanation
  Tech: BERT fine-tune or LLM + RAG

Medical FAQ Chatbot:
  Input: health question
  Output: answer grounded in verified medical texts (RAG)
  Tech: LLaMA 3 + LangChain + Chroma vector DB

Code Review Assistant:
  Input: Java/Python code snippet
  Output: suggestions, bugs, improvements
  Tech: fine-tuned CodeLlama or GPT-4 API

━━━━━ COMPUTER VISION CAPSTONE IDEAS ━━━━━

Plant Disease Detector:
  Input: photo of plant leaf
  Output: disease name + confidence + treatment advice
  Tech: ResNet/EfficientNet fine-tuned on PlantVillage dataset

Pothole Detection System:
  Input: dashcam video frame
  Output: bounding boxes around potholes + severity score
  Tech: YOLOv8 fine-tuned on custom or open dataset

Signature Forgery Detector:
  Input: two signature images
  Output: genuine / forged + confidence
  Tech: Siamese network with contrastive loss

━━━━━ DEPLOYMENT STACK ━━━━━
  Model → FastAPI → Docker → Render/Railway (free hosting)
  + HuggingFace Spaces demo (Gradio — 10 lines of code for a UI)

  import gradio as gr
  def predict(image): return model(image)
  gr.Interface(fn=predict, inputs="image", outputs="label").launch()

📚 500 AI project ideas: https://github.com/ashishpatel26/500-AI-Machine-learning-Deep-learning-Computer-vision-NLP-Projects-with-code`,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // TOOLS & RESOURCES
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "resources",
    parentId: "root-ai",
    text: "Tools & Resources",
    description: `The definitive reference list for your 4-month journey.

━━━━━ SETUP ━━━━━
  Miniconda (env manager): https://docs.conda.io/en/latest/miniconda.html
  Google Colab (free GPU): https://colab.research.google.com
  VS Code + Python ext:    https://code.visualstudio.com/

━━━━━ LIBRARIES ━━━━━
  numpy, pandas, matplotlib, seaborn  → data science
  scikit-learn                        → classical ML
  torch, torchvision                  → deep learning
  transformers, datasets, peft        → LLMs / NLP
  ultralytics                         → YOLOv8
  opencv-python                       → image processing
  fastapi, uvicorn                    → model serving
  mlflow                              → experiment tracking
  gradio, streamlit                   → demo UIs

━━━━━ BEST YOUTUBE CHANNELS ━━━━━
  3Blue1Brown              → math intuition (ESSENTIAL)
  StatQuest (Josh Starmer) → ML explained clearly (ESSENTIAL)
  Andrej Karpathy          → deep DL (ex-Tesla/OpenAI AI Director)
  Yannic Kilcher            → paper breakdowns
  Sentdex                  → practical coding tutorials
  Two Minute Papers        → latest AI research summaries

━━━━━ FREE COURSES ━━━━━
  Fast.ai Practical DL:         https://course.fast.ai/
  HuggingFace NLP Course:       https://huggingface.co/course/
  CS231n Computer Vision:       https://cs231n.github.io/
  CS224n NLP (Stanford):        https://web.stanford.edu/class/cs224n/
  Made With ML (MLOps):         https://madewithml.com/
  Andrew Ng ML (Coursera):      https://www.coursera.org/learn/machine-learning

━━━━━ FREE BOOKS ━━━━━
  Deep Learning (Goodfellow):   https://www.deeplearningbook.org/
  Dive into DL (code-first):    https://d2l.ai/
  Learn PyTorch:                https://www.learnpytorch.io/
  Math for ML (Cambridge):      https://mml-book.github.io/

━━━━━ RESEARCH PAPER SITES ━━━━━
  arXiv (preprints):            https://arxiv.org/
  Papers With Code:             https://paperswithcode.com/
  Semantic Scholar:             https://www.semanticscholar.org/

━━━━━ PRACTICE ━━━━━
  Kaggle (datasets+competitions): https://www.kaggle.com/
  HuggingFace Hub (models):       https://huggingface.co/
  LeetCode ML questions:          https://leetcode.com/`,
  },
];

async function seed() {
  console.log(`\nSeeding ${nodes.length} nodes into AI Learning Roadmap...\n`);
  let ok = 0, fail = 0;
  for (const node of nodes) {
    try {
      await createNode(node);
      console.log(`  ✓  ${node.text}`);
      ok++;
    } catch (err) {
      console.error(`  ✗  ${node.text}  →  ${err.message}`);
      fail++;
    }
  }
  console.log(`\n  Done — ${ok} created, ${fail} failed.\n`);
}

seed();
