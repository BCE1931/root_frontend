// Batch 1: Enrich supervised learning + foundational nodes
const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "src", "defaultData.json");
const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

const updates = {

"numpy": `━━━ WHY WAS NUMPY INVENTED? ━━━

BACKDROP — The Problem Before NumPy:
Python (1991) had no efficient array type. Every numerical operation required explicit Python loops.
Pure Python loop over 1 million numbers: ~100 ms.
NumPy vectorised C operation: ~1 ms. That's 100× faster.
Travis Oliphant merged "Numeric" and "Numarray" in 2005 to create NumPy — the missing foundation for scientific Python.

━━━ WHAT IT IS ━━━

NumPy = Numerical Python.
Core object: ndarray — a fixed-type, N-dimensional array stored in contiguous C memory.
Every AI framework (PyTorch, TensorFlow, JAX, scikit-learn) is built on top of NumPy's concepts.

━━━ HOW IT WORKS ━━━

  import numpy as np
  a = np.array([1, 2, 3])            # 1-D array
  m = np.array([[1,2],[3,4]])        # 2-D matrix
  img = np.zeros((3, 224, 224))      # 3-D: RGB image 224x224

KEY OPERATIONS:
  np.dot(a, b)        # dot product — used in every neural net layer
  A @ B               # matrix multiply (Python 3.5+)
  a.reshape(2, -1)    # change shape, infer missing dim
  a[0:3, 1:4]         # slicing rows 0-2, cols 1-3
  a * 2               # element-wise (no loop!)
  np.mean(a), np.std(a), np.max(a)

BROADCASTING:
  a = np.array([1, 2, 3])
  a + 10              # → [11, 12, 13]  — NumPy expands scalar, runs in C
  Rule: compare shapes right-to-left; dim must be equal or 1.

━━━ REAL-WORLD EXAMPLES ━━━

• Tesla FSD: Each camera frame = np.array shape [3, 224, 224]. 8 cameras × 36 fps = processed in realtime using vectorised NumPy-like GPU ops.
• Hubble Space Telescope: Raw image data (FITS format) loaded into NumPy arrays for signal processing.
• OpenAI CLIP: Image embeddings = float32 arrays of shape [512]. Similarity = np.dot(img_emb, text_emb).
• Radiologists (AI assist): CT scan = array shape [512, 512, 1000] (1000 cross-section slices).
• Google Photos: Face detection runs on NumPy-like tensor ops for every image you upload.

━━━ BENEFITS ━━━

• 100–1000× faster than Python loops (C/Fortran under the hood)
• Vectorised — no explicit for loops needed in code
• Universal foundation: PyTorch tensors, TF tensors mirror NumPy API
• Memory efficient: contiguous typed arrays, not Python object overhead

━━━ DISADVANTAGES ━━━

• CPU only — NumPy has no GPU support
• No automatic differentiation — cannot compute gradients for training neural nets
• Entire array must fit in RAM — no out-of-core computation
• Fixed dtype per array (all float32 or all int64)

━━━ WHAT SOLVED THOSE DISADVANTAGES ━━━

• PyTorch tensors: NumPy API + GPU support + automatic gradients (autograd)
• CuPy: drop-in NumPy replacement that runs on NVIDIA GPU via CUDA
• Dask: chunked NumPy arrays for datasets larger than RAM
• JAX: NumPy API + GPU/TPU + JIT compilation + autograd

━━━ INTERVIEW QUESTIONS ━━━

Q: What is broadcasting in NumPy? Give an example.
A: Operations between arrays of different shapes by virtually expanding the smaller array. E.g., shape (3,) + scalar → (3,). Shapes compared right-to-left; each dim must be equal or 1.

Q: Difference between a NumPy view (slice) and np.copy()?
A: Slice = view into same memory (modifying it modifies original). np.copy() = independent array. This matters when you want to modify a subset without affecting the source.

Q: Why is NumPy faster than Python lists for math?
A: NumPy stores data as contiguous C memory with a fixed type. Operations run as compiled C loops without Python interpreter overhead per element.

Q: What does reshape(-1, 1) do?
A: Infers the first dimension automatically. Shape (6,) → (6, 1), converting a row vector to a column vector.

Q: How do you find the index of the maximum value in a 2-D array per row?
A: np.argmax(arr, axis=1) — returns index of max along axis 1 (columns) for each row.

🎥 NumPy Full Tutorial (freeCodeCamp): https://www.youtube.com/watch?v=QUT1VHiLmmI
🎥 NumPy in 1 hour (Keith Galli): https://www.youtube.com/watch?v=GB9ByFAIAH4
📚 NumPy 100 exercises (GitHub): https://github.com/rougier/numpy-100
📚 NumPy official quickstart: https://numpy.org/doc/stable/user/quickstart.html`,

"pandas": `━━━ WHY WAS PANDAS INVENTED? ━━━

BACKDROP — The Problem Before Pandas:
Before Pandas (2008), working with tabular data in Python meant manually reading CSVs line-by-line, parsing types yourself, and writing 50-line loops for simple aggregations.
Wes McKinney was a quantitative analyst at AQR Capital who needed to do fast, flexible data analysis in Python the way R's data.frame allowed.
He built Pandas (2008) on top of NumPy to give Python the data table it was missing.

━━━ WHAT IT IS ━━━

Pandas = Panel Data (financial term) + Python.
Core objects:
  DataFrame — 2-D labelled table (rows × columns), like a database table or Excel sheet
  Series    — 1-D labelled array (a single column)

━━━ HOW IT WORKS ━━━

  import pandas as pd
  df = pd.read_csv("data.csv")
  df.head(5)              # first 5 rows
  df.info()               # dtypes + null counts
  df.describe()           # mean, std, min, max per column

CLEAN:
  df.dropna()                          # remove rows with any null
  df.fillna(df["age"].median())        # fill nulls with median
  df.drop_duplicates()
  df["date"] = pd.to_datetime(df["date"])

TRANSFORM:
  df["bmi"] = df["weight"] / df["height"]**2    # new feature
  df.groupby("city")["salary"].mean()            # GROUP BY
  df.merge(orders_df, on="user_id", how="left")  # SQL LEFT JOIN
  df[df["age"] > 25]                             # filter rows
  df.sort_values("salary", ascending=False)

━━━ REAL-WORLD EXAMPLES ━━━

• Airbnb: Data scientists load 2M booking rows, merge with pricing table, compute price_per_bedroom feature in 15 lines of Pandas.
• JPMorgan: Risk analysts use Pandas to aggregate daily P&L across thousands of trading positions.
• Kaggle competitions: Every top submission starts with pd.read_csv() and df.describe().
• Spotify: A/B test results (which UI change drove more streams?) analysed with Pandas groupby + t-test.
• Uber: Surge pricing model training data prepared using Pandas — merge ride requests with supply data.

━━━ BENEFITS ━━━

• Read 30+ formats: CSV, JSON, Parquet, Excel, SQL databases
• Expressive SQL-like operations (groupby, merge, pivot) in Python
• Handles millions of rows comfortably
• Built-in missing value handling
• Direct integration with Matplotlib, scikit-learn, PyTorch

━━━ DISADVANTAGES ━━━

• Single-threaded — does not use multiple CPU cores
• Everything must fit in RAM
• Slow for very large datasets (>1GB can get sluggish)
• Confusing copy vs view semantics (SettingWithCopyWarning)

━━━ WHAT SOLVED THOSE DISADVANTAGES ━━━

• Polars: Pandas-like API, written in Rust, 5–20× faster, multithreaded
• Dask: Parallel, out-of-core Pandas for datasets larger than RAM
• PySpark: Distributed Pandas across a cluster (for TB-scale data)
• Modin: Drop-in Pandas replacement using Ray for parallelism

━━━ INTERVIEW QUESTIONS ━━━

Q: What is the difference between loc and iloc?
A: loc uses label-based indexing (column names, index labels). iloc uses integer position-based indexing (0, 1, 2...). df.loc[0, "age"] vs df.iloc[0, 2].

Q: How do you handle missing values in Pandas?
A: df.isnull().sum() to count. Then: dropna() to remove rows, fillna(value) to fill with constant, fillna(df.mean()) for mean imputation, or interpolate() for time series.

Q: What is groupby + agg?
A: Groups rows by a column, then applies an aggregation. df.groupby("department")["salary"].agg(["mean","max","count"]) — gives stats per department, like SQL GROUP BY.

Q: Difference between merge and join?
A: merge() is more flexible — merge on any column(s), supports left/right/inner/outer. join() is a shortcut that merges on the index. Use merge() in practice.

Q: What is a SettingWithCopyWarning and how do you fix it?
A: Happens when you try to set a value on a slice (which may be a copy). Fix: use .copy() explicitly — df2 = df[df["age"] > 25].copy() — then modify df2 safely.

🎥 Pandas Full Tutorial (Corey Schafer): https://www.youtube.com/watch?v=ZyhVh-qRZPA
🎥 Pandas for Data Analysis (Keith Galli): https://www.youtube.com/watch?v=vmEHCJofslg
📚 10 Minutes to Pandas (official): https://pandas.pydata.org/docs/user_guide/10min.html
📚 Polars (faster alternative): https://pola.rs/`,

"matplotlib": `━━━ WHY WAS MATPLOTLIB INVENTED? ━━━

BACKDROP — The Problem Before Matplotlib:
In 2002, John Hunter was a neurologist analysing seizure data. He needed to plot EEG signals in Python but had no tool. MATLAB had great plotting but was expensive and closed-source.
He built Matplotlib (2003) to replicate MATLAB's plotting API in Python — free and open-source.
Seaborn was added later (2012) by Michael Waskom to make statistical plots easier on top of Matplotlib.

━━━ WHAT IT IS ━━━

Matplotlib: Low-level, highly customisable plotting library.
Seaborn: High-level statistical plotting on top of Matplotlib with better defaults.

Rule: Always visualise data BEFORE training any model.
A histogram might show age=999 (data error). A heatmap might show two features are 99% correlated (drop one).

━━━ KEY PLOTS & WHEN TO USE ━━━

  import matplotlib.pyplot as plt
  import seaborn as sns

  plt.hist(df["age"], bins=30)              # distribution of one feature
  plt.scatter(df["sqft"], df["price"])      # relationship between two features
  sns.heatmap(df.corr(), annot=True)        # find correlated features
  sns.boxplot(x="class", y="age", data=df) # outliers + quartiles per group
  sns.pairplot(df)                          # all pairwise scatter plots
  plt.plot(train_losses, label="train")     # loss curves during training
  plt.imshow(image_array)                  # display an image

━━━ REAL-WORLD EXAMPLES ━━━

• Netflix Engineering: Plot viewing duration distributions per country. Spike at 0 min = user bounced — caught with histogram, not by training a model.
• Tesla: Engineers plot sensor calibration errors over time to detect sensor drift before retraining.
• Medical AI: Radiologists use Matplotlib to visualise model attention maps (Grad-CAM) overlaid on X-rays.
• Kaggle winners: Every Kaggle notebook submission includes EDA visualisations — judges value this.
• OpenAI: Training loss curves for GPT-4 plotted with Matplotlib to monitor convergence.

━━━ ESSENTIAL PLOTS TO KNOW ━━━

• Histogram          — understand distribution of a feature (skewed? bimodal?)
• Scatter plot        — find correlations between two features
• Correlation heatmap — identify redundant features to drop
• Box plot            — quickly see outliers and quartiles
• Loss/accuracy curve — is your neural net actually training?
• Confusion matrix    — which classes is your classifier confusing?
• ROC curve           — how does precision/recall trade off?

━━━ BENEFITS ━━━

• Extremely flexible — you control every pixel
• Works inside Jupyter notebooks (inline output)
• Seaborn makes beautiful statistical plots with 1-2 lines
• 20+ years of examples and Stack Overflow answers

━━━ DISADVANTAGES ━━━

• Verbose API — a simple styled chart takes 10+ lines in Matplotlib
• Static images — no interactivity (hover, zoom, filter)
• Defaults are ugly compared to modern tools

━━━ WHAT SOLVED THOSE DISADVANTAGES ━━━

• Plotly: Interactive charts (hover, zoom, filter) in Python, renders in browser
• Bokeh: Web-ready interactive plots
• Altair: Declarative, concise chart grammar
• Streamlit: Build full interactive data apps with plots in pure Python

━━━ INTERVIEW QUESTIONS ━━━

Q: What is the difference between plt.show() and plt.savefig()?
A: plt.show() renders the plot to screen (or inline in Jupyter). plt.savefig("out.png") saves to disk. In production scripts, always savefig; in notebooks, show.

Q: When would you use Seaborn over Matplotlib?
A: Seaborn for quick, beautiful statistical plots (distributions, regressions, categorical comparisons). Matplotlib for custom layouts, subplots, embedding plots in papers.

Q: How do you plot a confusion matrix?
A: from sklearn.metrics import ConfusionMatrixDisplay; ConfusionMatrixDisplay.from_predictions(y_true, y_pred).plot() — or use sns.heatmap on the matrix array.

Q: What does a loss curve that decreases then spikes tell you?
A: Training was progressing but something destabilised learning — likely learning rate too high, data shuffling issue, or a bad batch. Check for NaN in data.

🎥 Matplotlib Tutorial (Corey Schafer): https://www.youtube.com/watch?v=UO98lJQ3QGI
🎥 Seaborn Tutorial: https://www.youtube.com/watch?v=6GUZXDef2U0
📚 Plotly (interactive): https://plotly.com/python/
📚 Matplotlib cheatsheet: https://matplotlib.org/cheatsheets/`,

"linear-reg": `━━━ WHY WAS LINEAR REGRESSION INVENTED? ━━━

BACKDROP — The Problem Before:
In the 1800s, scientists needed to predict values (crop yields, astronomical positions) from measurements.
Francis Galton (1886) formalized regression studying how children's heights "regress toward the mean" relative to parents.
Carl Friedrich Gauss independently developed least-squares method (~1795) for planetary orbit prediction.
Before regression, predictions were done by simple averaging or expert opinion — not data-driven.

━━━ WHAT IT IS ━━━

Linear Regression predicts a continuous numerical output from one or more inputs.
Equation: y = w1*x1 + w2*x2 + ... + b
Goal: find weights (w) and bias (b) that minimise the error between predictions and actual values.

━━━ HOW IT WORKS ━━━

  from sklearn.linear_model import LinearRegression
  from sklearn.model_selection import train_test_split
  from sklearn.metrics import mean_squared_error
  import numpy as np

  X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
  model = LinearRegression()
  model.fit(X_train, y_train)
  preds = model.predict(X_test)
  print("RMSE:", np.sqrt(mean_squared_error(y_test, preds)))

LEARNING: Minimise MSE (Mean Squared Error) = mean((y_pred - y_actual)²)
Solved analytically: w = (XᵀX)⁻¹Xᵀy  — or via gradient descent.

ASSUMPTIONS (must check):
  • Linear relationship between features and target
  • Features are independent (no multicollinearity)
  • Errors are normally distributed (homoscedasticity)
  • No major outliers

━━━ REAL-WORLD EXAMPLES ━━━

• Zillow/Zestimate: Predicts house prices from bedrooms, sqft, location using linear model as baseline.
• Insurance companies: Predict claim amounts from age, health history, coverage type.
• Electricity companies: Predict next month's power demand from weather + population + season.
• Amazon: Price elasticity model — linear regression on price vs. demand to set optimal prices.
• Medical: Predict blood pressure from age, weight, exercise frequency.

━━━ BENEFITS ━━━

• Extremely fast to train — even on millions of rows
• Highly interpretable — each weight tells you the exact effect of that feature
• Good baseline for any regression problem
• Works well when the relationship is actually linear

━━━ DISADVANTAGES ━━━

• Assumes linearity — fails on non-linear relationships
• Sensitive to outliers (MSE squares the error, making outliers very influential)
• Cannot capture interaction effects without feature engineering
• Fails when features are correlated (multicollinearity inflates weights)

━━━ WHAT SOLVED THOSE DISADVANTAGES ━━━

• Ridge Regression: adds L2 regularisation to handle multicollinearity
• Lasso Regression: adds L1 regularisation, also performs feature selection (zeroes out weak features)
• Polynomial Regression: adds x², x³ terms to model curves
• Random Forest / XGBoost: handles non-linearity and outliers naturally
• Neural Networks: approximate any function, not just linear

━━━ INTERVIEW QUESTIONS ━━━

Q: What is the difference between R² and RMSE?
A: R² (0 to 1) measures what proportion of variance in y is explained by the model. RMSE measures average error in the same units as y. Use R² for model comparison; RMSE to understand practical error size.

Q: What is regularisation and why do we use it?
A: Adding a penalty term to the loss function to prevent overfitting. Ridge adds λΣw² (shrinks weights toward 0). Lasso adds λΣ|w| (can zero out features = feature selection).

Q: What happens if two features are perfectly correlated (multicollinearity)?
A: Weights become unstable — tiny data changes cause huge weight swings. The model can still predict well but interpretation breaks. Fix: remove one feature or use Ridge regression.

Q: What does the slope coefficient w tell you?
A: For every 1-unit increase in feature x, the prediction increases by w units (holding all else constant).

Q: Difference between Linear Regression and Logistic Regression?
A: Linear Regression predicts a continuous value (house price). Logistic Regression predicts a probability (0-1) for binary classification using the sigmoid function.

Q: How do you detect if your model is overfitting?
A: Training error is much lower than validation error. Fix: add regularisation, reduce features, or get more data.

🎥 StatQuest Linear Regression: https://www.youtube.com/watch?v=7ArmBVF2dCs
🎥 Ridge & Lasso (StatQuest): https://www.youtube.com/watch?v=NGf0voTMlcs
📚 Scikit-learn LinearRegression: https://scikit-learn.org/stable/modules/linear_model.html
📚 Hands-On ML Chapter 4: https://github.com/ageron/handson-ml3`,

"logistic-reg": `━━━ WHY WAS LOGISTIC REGRESSION INVENTED? ━━━

BACKDROP — The Problem Before:
Scientists needed to model binary outcomes (survive/die, buy/not buy) from continuous inputs.
Linear Regression applied to binary outputs can predict probabilities outside [0,1] — meaningless.
In 1958, David Cox introduced Logistic Regression using the sigmoid (logistic) function to squash any output to [0, 1].
It became the standard for medical research (does drug X prevent disease Y?) and remains so today.

━━━ WHAT IT IS ━━━

Logistic Regression predicts the probability of a binary outcome (0 or 1).
Despite the name, it is a CLASSIFICATION algorithm, not regression.
Equation: p = sigmoid(w1*x1 + ... + b) where sigmoid(z) = 1 / (1 + e^-z)
Decision rule: predict class 1 if p > 0.5, class 0 otherwise.

━━━ HOW IT WORKS ━━━

  from sklearn.linear_model import LogisticRegression
  from sklearn.metrics import classification_report, roc_auc_score

  model = LogisticRegression(max_iter=1000)
  model.fit(X_train, y_train)
  probs = model.predict_proba(X_test)[:, 1]   # probability of class 1
  preds = model.predict(X_test)
  print(classification_report(y_test, preds))
  print("AUC:", roc_auc_score(y_test, probs))

LOSS FUNCTION: Binary Cross-Entropy (Log Loss)
  Loss = -[y * log(p) + (1-y) * log(1-p)]
  Penalises confident wrong predictions very heavily.
  Minimised using gradient descent.

━━━ REAL-WORLD EXAMPLES ━━━

• Gmail Spam Filter (classical version): Trained on 100M+ emails. Each email → feature vector → logistic regression probability of spam. Still used as baseline layer.
• Credit Card Approval: Banks use logistic regression to predict P(default) from income, debt, history.
• Medical Diagnosis: Predict P(diabetes) from blood sugar, BMI, age. FDA approves these models because they are interpretable.
• A/B Testing Analysis: Was this UI change statistically significant? Logistic regression on click (1/0) ~ variant.
• Kaggle Titanic: The "hello world" logistic regression problem. Still competitive baseline.

━━━ BENEFITS ━━━

• Outputs a probability, not just a class — crucial for risk systems
• Highly interpretable: weights show direction and magnitude of each feature's effect
• Fast to train even on millions of rows
• Works as a strong baseline before trying complex models

━━━ DISADVANTAGES ━━━

• Assumes linear decision boundary — fails when classes are not linearly separable
• Sensitive to correlated features (same as Linear Regression)
• Cannot capture complex non-linear patterns

━━━ WHAT SOLVED THOSE DISADVANTAGES ━━━

• SVM with RBF kernel: non-linear decision boundary
• Neural Networks: multi-layer = non-linear boundaries
• Gradient Boosting (XGBoost): handles complex patterns and feature interactions

━━━ INTERVIEW QUESTIONS ━━━

Q: Why use cross-entropy loss instead of MSE for classification?
A: MSE on probabilities has flat gradients near 0 and 1, making learning very slow. Cross-entropy penalises confident wrong predictions exponentially, giving strong gradients throughout.

Q: What is the ROC-AUC score and what does 0.5 mean?
A: ROC curve plots True Positive Rate vs False Positive Rate at all thresholds. AUC = area under that curve. 0.5 = random guessing. 1.0 = perfect. Good models are > 0.85.

Q: How do you handle class imbalance in Logistic Regression?
A: Set class_weight="balanced" in sklearn (weights rare class more in loss). Or use SMOTE oversampling. Or adjust the decision threshold below 0.5.

Q: What is the difference between predict() and predict_proba()?
A: predict() returns hard class labels (0 or 1). predict_proba() returns [P(class=0), P(class=1)]. Always use predict_proba for AUC calculation or risk systems.

Q: Can Logistic Regression handle multi-class problems?
A: Yes. sklearn uses One-vs-Rest (OvR) by default — trains one binary classifier per class. Or use multi_class="multinomial" for softmax over all classes.

Q: What is L1 vs L2 regularisation in Logistic Regression?
A: L2 (Ridge) shrinks all weights toward zero — handles multicollinearity. L1 (Lasso) can zero out weak features — automatic feature selection. Use solver="saga" for L1 in sklearn.

🎥 Logistic Regression (StatQuest): https://www.youtube.com/watch?v=yIYKR4sgzI8
🎥 ROC and AUC explained: https://www.youtube.com/watch?v=4jRBRDbJemM
📚 Sklearn LogisticRegression: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html`,

"trees-forests": `━━━ WHY WERE DECISION TREES INVENTED? ━━━

BACKDROP — The Problem Before:
Linear models (Linear/Logistic Regression) cannot model non-linear decision boundaries without manual feature engineering.
In 1984, Breiman et al. invented CART (Classification and Regression Trees) — a model that learns rules like:
"IF sqft > 2000 AND bedrooms >= 3 AND location = suburb THEN price = $400K"
These rules are learned automatically from data, mirroring how humans make decisions.
Random Forest (Leo Breiman, 2001) combined hundreds of trees to fix individual tree instability.

━━━ HOW DECISION TREES WORK ━━━

At each node, the tree asks a yes/no question about a feature.
It picks the question that most separates the classes = maximises Information Gain (or minimises Gini impurity).

  from sklearn.tree import DecisionTreeClassifier
  model = DecisionTreeClassifier(max_depth=5)   # limit depth to prevent overfitting
  model.fit(X_train, y_train)

  from sklearn.tree import plot_tree
  plot_tree(model, feature_names=feature_names, class_names=["No","Yes"], filled=True)

GINI IMPURITY: Gini = 1 - Σ p_i²
  A pure node (all one class) has Gini = 0.
  A perfectly mixed node (50/50) has Gini = 0.5.
  Tree picks the split that maximises the reduction in Gini.

━━━ HOW RANDOM FOREST WORKS ━━━

Trains N independent trees (default 100) each on a RANDOM BOOTSTRAP sample of data.
Each split considers only a RANDOM SUBSET of features.
Final prediction = majority vote (classification) or average (regression).

  from sklearn.ensemble import RandomForestClassifier
  rf = RandomForestClassifier(n_estimators=100, max_features="sqrt", random_state=42)
  rf.fit(X_train, y_train)
  print(rf.feature_importances_)   # which features matter most?

━━━ REAL-WORLD EXAMPLES ━━━

• Stripe Fraud Detection: Random Forest on transaction features (amount, location, time of day, merchant category). Millions of transactions per day classified in < 100ms.
• Healthcare (Epic EHR): Decision trees embedded in hospital software to flag sepsis risk from vitals.
• Zillow: Random Forest model for home price estimation was their v1 Zestimate.
• Insurance: Allstate uses Random Forest to predict claim frequency from driver history, vehicle type, zip code.
• Banking (Capital One): Credit limit decisions use Random Forest trained on payment history.

━━━ BENEFITS ━━━

• Handles non-linear relationships automatically
• No feature scaling needed (unlike SVM, KNN, neural nets)
• Handles mixed types (numeric + categorical after encoding)
• Random Forest: resistant to overfitting and outliers
• Feature importance: tells you which inputs matter most
• Fast inference — a tree is just a series of if-else comparisons

━━━ DISADVANTAGES ━━━

• Single Decision Tree: very prone to overfitting (memorises training data)
• Random Forest: slow to train on very large datasets (100 trees × full data)
• Not great for NLP or image data (need feature engineering)
• Hard to interpret a Random Forest of 100 trees

━━━ WHAT SOLVED THOSE DISADVANTAGES ━━━

• Gradient Boosting (XGBoost, LightGBM): trees trained sequentially, fixing previous errors. Usually beats Random Forest in competitions.
• SHAP values: explain Random Forest and XGBoost predictions post-hoc (interpretability fix)
• Neural Networks: better for images, text, sequences where raw features are not tabular

━━━ INTERVIEW QUESTIONS ━━━

Q: What is the difference between bagging and boosting?
A: Bagging (Random Forest): trains N trees in parallel on random subsets, averages predictions — reduces variance. Boosting (XGBoost): trains trees sequentially, each fixing errors of the previous — reduces bias.

Q: How does Random Forest avoid overfitting compared to a single Decision Tree?
A: Two randomness sources: (1) each tree trained on a bootstrap sample (~63% of data); (2) each split considers only sqrt(n_features) features. This decorrelates trees so their errors cancel when averaged.

Q: What is feature importance in Random Forest?
A: Average decrease in impurity (Gini) caused by splits on that feature across all trees. Higher = more important. Use rf.feature_importances_.

Q: How do you tune a Decision Tree to avoid overfitting?
A: max_depth (limit tree depth), min_samples_split (minimum samples to allow a split), min_samples_leaf (minimum samples in a leaf node).

Q: When would you choose Random Forest over XGBoost?
A: Random Forest is better when you need fast training, good default performance, and robustness with no tuning. XGBoost is better when you need maximum accuracy and are willing to tune hyperparameters.

🎥 Decision Trees (StatQuest): https://www.youtube.com/watch?v=_L39rN6gz7Y
🎥 Random Forest (StatQuest): https://www.youtube.com/watch?v=J4Wdy0Wc_xQ
📚 Sklearn RandomForest: https://scikit-learn.org/stable/modules/ensemble.html
📚 SHAP (model explainability): https://shap.readthedocs.io/`,

"gradient-boosting": `━━━ WHY WAS GRADIENT BOOSTING INVENTED? ━━━

BACKDROP — The Problem Before:
Random Forest reduced variance by averaging many independent trees.
But high-bias problems (model too simple) couldn't be fixed by averaging.
In 1999, Jerome Friedman invented Gradient Boosting: instead of averaging independent trees, train trees SEQUENTIALLY — each new tree learns to correct the errors (residuals) of the previous.
XGBoost (Chen & Guestrin, 2016) added regularisation, sparse-aware algorithms, and parallelism — winning almost every Kaggle tabular competition from 2016-2020.

━━━ HOW IT WORKS ━━━

Step 1: Start with a simple prediction (mean of y).
Step 2: Compute residuals = actual - predicted.
Step 3: Train a small tree to predict those residuals.
Step 4: Update prediction = old_prediction + learning_rate × new_tree.
Step 5: Repeat steps 2-4 for N rounds.

  import xgboost as xgb
  from sklearn.model_selection import train_test_split
  from sklearn.metrics import mean_squared_error

  model = xgb.XGBClassifier(
      n_estimators=300,
      learning_rate=0.05,
      max_depth=6,
      subsample=0.8,
      colsample_bytree=0.8,
      random_state=42
  )
  model.fit(X_train, y_train, eval_set=[(X_test, y_test)], early_stopping_rounds=20)
  preds = model.predict(X_test)

KEY HYPERPARAMETERS:
  n_estimators     — number of trees (more = better but slower; use early stopping)
  learning_rate    — step size per tree (lower = more trees needed, often better)
  max_depth        — tree complexity (3-8 typical)
  subsample        — fraction of data per tree (0.8 adds randomness, prevents overfitting)
  colsample_bytree — fraction of features per tree

━━━ LIGHTGBM vs XGBOOST ━━━

LightGBM (Microsoft, 2017):
• Grows trees LEAF-wise (not level-wise like XGBoost) — faster on large datasets
• Handles categorical features natively (no one-hot encoding needed)
• 10× faster than XGBoost on large datasets
• Use for datasets > 100K rows

  import lightgbm as lgb
  model = lgb.LGBMClassifier(n_estimators=500, learning_rate=0.05, num_leaves=31)

━━━ REAL-WORLD EXAMPLES ━━━

• Booking.com: Gradient Boosting model predicts which hotel a user will book next — used in production serving 1.5M bookings/day.
• American Express: Fraud detection model (XGBoost) processes every card transaction in milliseconds.
• Airbnb: XGBoost predicts whether a booking inquiry will be accepted — helps hosts and guests.
• Kaggle: XGBoost or LightGBM won >60% of tabular data competitions from 2016-2023.
• Lyft: Surge pricing model trained on XGBoost with ride demand features.

━━━ BENEFITS ━━━

• Best out-of-the-box performance on tabular (spreadsheet) data
• Handles missing values natively (no imputation needed in XGBoost)
• Built-in feature importance
• Regularisation prevents overfitting
• Early stopping = automatically stops when validation stops improving

━━━ DISADVANTAGES ━━━

• Slower to train than Random Forest (sequential, not parallel)
• More hyperparameters to tune
• Can overfit with too many estimators and no early stopping
• Not suitable for images, audio, raw text (need deep learning)

━━━ WHAT SOLVED THOSE DISADVANTAGES ━━━

• Early stopping: monitor val loss and stop when it stops improving
• Optuna / Hyperopt: automated hyperparameter tuning
• CatBoost (Yandex): handles categoricals natively even better; good default accuracy without tuning
• TabNet (Google): neural network approach to tabular data

━━━ INTERVIEW QUESTIONS ━━━

Q: What is the difference between bagging (Random Forest) and boosting (XGBoost)?
A: Bagging: parallel trees on random subsets → reduces variance. Boosting: sequential trees, each correcting previous residuals → reduces bias. Boosting is usually more accurate but slower and needs careful tuning.

Q: What does the learning_rate control in gradient boosting?
A: How much each tree contributes to the final prediction. Lower = each tree has small impact, need more trees, but generalises better. Typical: 0.01–0.1 with many trees.

Q: What is early stopping?
A: Monitor validation loss during training. When it stops improving for N rounds, stop training. Prevents overfitting. Use eval_set + early_stopping_rounds in XGBoost.

Q: Why is XGBoost better than basic Gradient Boosting (sklearn)?
A: XGBoost adds L1/L2 regularisation, handles missing values natively, uses approximate tree-building algorithm for speed, supports parallel split finding, and column/row subsampling.

Q: What is SHAP and why is it used with XGBoost?
A: SHAP (SHapley Additive exPlanations) assigns each feature a contribution value for each prediction. Allows explaining WHY XGBoost made a specific prediction — crucial for regulated industries (banking, medical).

🎥 XGBoost (StatQuest): https://www.youtube.com/watch?v=OtD8wVaFm6E
🎥 LightGBM vs XGBoost: https://www.youtube.com/watch?v=n_ZMQj09S6w
📚 XGBoost documentation: https://xgboost.readthedocs.io/
📚 LightGBM documentation: https://lightgbm.readthedocs.io/
📚 SHAP values: https://shap.readthedocs.io/`,

"kmeans": `━━━ WHY WAS K-MEANS INVENTED? ━━━

BACKDROP — The Problem Before:
Scientists had large datasets (customer records, gene expression) with no labels.
You cannot use supervised learning without labels — and labelling millions of records manually is impossible.
Stuart Lloyd developed K-Means in 1957 (published 1982) for pulse-code modulation at Bell Labs.
Hartigan & Wong formalised it in 1979. K-Means became the default "find groups in unlabelled data" tool.

━━━ WHAT IT IS ━━━

K-Means: partition N data points into K clusters by minimising the within-cluster sum of squared distances.
Unsupervised = no labels needed. The algorithm finds natural groupings.

━━━ HOW IT WORKS ━━━

Step 1: Randomly initialise K centroids.
Step 2: Assign each point to nearest centroid (Euclidean distance).
Step 3: Recompute centroid = mean of all assigned points.
Step 4: Repeat steps 2-3 until centroids don't move (convergence).

  from sklearn.cluster import KMeans
  import matplotlib.pyplot as plt

  km = KMeans(n_clusters=4, random_state=42, n_init=10)
  km.fit(X)
  labels = km.labels_
  centers = km.cluster_centers_
  print("Inertia:", km.inertia_)  # sum of squared distances to nearest centroid

CHOOSING K — The Elbow Method:
  inertias = [KMeans(n_clusters=k).fit(X).inertia_ for k in range(2, 11)]
  plt.plot(range(2, 11), inertias)  # look for the "elbow" — where improvement slows

━━━ REAL-WORLD EXAMPLES ━━━

• Spotify: K-Means on audio features (tempo, energy, valence) to create music genres. "Discover Weekly" starts from cluster membership.
• Airbnb: Cluster neighbourhoods by property attributes (price, rating, size) to group similar listings for search ranking.
• Uber: Cluster pickup locations to plan driver positioning and surge pricing zones.
• Retail (Walmart): Cluster customers by purchase history into segments (budget shoppers, premium shoppers, seasonal buyers) for targeted promotions.
• Netflix: Cluster users by viewing behaviour to seed collaborative filtering recommender.

━━━ BENEFITS ━━━

• Simple and fast — O(n × k × iterations), scales to millions of points
• Works well when clusters are roughly spherical and equal-size
• Widely supported in every ML library
• Results are interpretable: centroids represent the "average" of each cluster

━━━ DISADVANTAGES ━━━

• Must choose K in advance (non-trivial)
• Sensitive to initialisation — bad starting centroids → bad clusters (use n_init=10)
• Assumes spherical clusters — fails on elongated or non-convex shapes
• Sensitive to scale — always StandardScaler before K-Means
• Sensitive to outliers — one outlier can pull a centroid far off

━━━ WHAT SOLVED THOSE DISADVANTAGES ━━━

• K-Means++ initialisation: smarter centroid initialisation (sklearn default) — nearly eliminates bad initialisation
• DBSCAN: finds arbitrarily shaped clusters and automatically marks outliers as noise. No K needed.
• Gaussian Mixture Models (GMM): soft cluster assignments + handles elliptical shapes
• Agglomerative Clustering (hierarchical): no K needed upfront — build a dendrogram

━━━ INTERVIEW QUESTIONS ━━━

Q: How do you choose the right number of clusters K?
A: Elbow method: plot inertia vs K, pick the "elbow". Silhouette score: measures how similar each point is to its cluster vs the next-closest cluster (range -1 to 1, higher = better). Domain knowledge is often the best guide.

Q: Why must you scale features before K-Means?
A: K-Means uses Euclidean distance. A feature ranging 0–100,000 (e.g., income) dominates over one ranging 0–1 (e.g., rating). StandardScaler normalises all features to mean=0, std=1.

Q: What is inertia in K-Means?
A: Sum of squared distances from each point to its nearest centroid. Lower = tighter clusters. But inertia always decreases as K increases — must use elbow method to find optimal K.

Q: What is the difference between K-Means and DBSCAN?
A: K-Means: requires K, assumes spherical clusters, assigns every point to a cluster. DBSCAN: no K needed, finds arbitrary shapes, marks outliers as noise. Use DBSCAN for geographic data and anomaly detection.

Q: What is K-Means++ initialisation?
A: Instead of random centroid placement, K-Means++ places the first centroid randomly, then each subsequent centroid with probability proportional to its distance from existing centroids. This leads to better convergence and is the sklearn default (init="k-means++").

🎥 K-Means (StatQuest): https://www.youtube.com/watch?v=4b5d3muPQmA
🎥 DBSCAN explained: https://www.youtube.com/watch?v=RDZUdRSDOok
📚 Sklearn clustering: https://scikit-learn.org/stable/modules/clustering.html`,

"pca": `━━━ WHY WAS PCA INVENTED? ━━━

BACKDROP — The Problem Before:
High-dimensional datasets (thousands of features) caused two problems:
1. Curse of dimensionality: ML models need exponentially more data to generalise as features grow.
2. Many features are correlated (redundant) — height and wingspan both measure "how big is the person".
Karl Pearson invented PCA in 1901 to find the most informative axes in multi-dimensional data.
Harold Hotelling formalised it in 1933. It remains the most widely used dimensionality reduction method.

━━━ WHAT IT IS ━━━

PCA finds a new coordinate system where:
• The first axis (PC1) points in the direction of maximum variance in the data.
• Each subsequent axis is perpendicular to the previous and captures the next most variance.
• By keeping only the top K principal components, you reduce dimensions while retaining most information.

━━━ HOW IT WORKS ━━━

  from sklearn.preprocessing import StandardScaler
  from sklearn.decomposition import PCA
  import matplotlib.pyplot as plt

  scaler = StandardScaler()
  X_scaled = scaler.fit_transform(X)

  pca = PCA(n_components=2)
  X_reduced = pca.fit_transform(X_scaled)

  print("Variance explained:", pca.explained_variance_ratio_)
  # [0.65, 0.20] → 2 components explain 85% of total variance

  plt.scatter(X_reduced[:, 0], X_reduced[:, 1], c=labels)
  plt.xlabel("PC1"); plt.ylabel("PC2")

HOW MANY COMPONENTS?
  pca = PCA(n_components=0.95)   # keep enough components to explain 95% of variance
  pca.fit(X_scaled)
  print(pca.n_components_)       # how many components needed

━━━ REAL-WORLD EXAMPLES ━━━

• Netflix: Reduce user-movie rating matrix (millions × thousands) to ~50 latent dimensions. Used as input to their recommendation engine.
• Face Recognition (Eigenfaces): Reduce 10,000-pixel face images to ~150 principal components. PCA was used in the first commercial face recognition systems (1990s).
• Genomics (23andMe): 500,000 genetic variants per person → PCA to 10 components. Used to identify ancestry without revealing specific genes.
• Finance: Reduce 500 stock return features to ~10 market factors (PCA = factor analysis).
• Manufacturing: Sensor data from 1000 sensors on factory floor → PCA to 5 components for anomaly detection.

━━━ BENEFITS ━━━

• Removes correlated/redundant features
• Speeds up training (fewer features = faster)
• Reduces overfitting risk
• Visualise high-D data in 2D/3D
• Denoising: small components often capture noise, dropping them cleans the data

━━━ DISADVANTAGES ━━━

• Components are linear combinations — not interpretable ("PC1 = 0.3×age + 0.5×income + ...")
• Information loss: you discard variance (even if small)
• Must StandardScale first — PCA is sensitive to feature scale
• Captures only LINEAR structure — non-linear variations are missed

━━━ WHAT SOLVED THOSE DISADVANTAGES ━━━

• t-SNE: Non-linear dimensionality reduction, excellent for 2D visualisation of clusters. Too slow for preprocessing.
• UMAP: Like t-SNE but faster and preserves global structure. Standard in bioinformatics (single-cell RNA-seq).
• Autoencoders: Neural network-based non-linear dimensionality reduction.
• ICA (Independent Component Analysis): finds statistically independent components (used in EEG/brain signal processing).

━━━ INTERVIEW QUESTIONS ━━━

Q: What does "explained variance ratio" mean in PCA?
A: The proportion of total variance in the data captured by each component. [0.65, 0.20] means PC1 captures 65% of variance, PC2 captures 20%. Together: 85% of information in 2 dimensions.

Q: Why must you StandardScale before PCA?
A: PCA finds directions of maximum variance. A feature with range 0–100,000 will dominate over one with range 0–1, simply because of scale. StandardScaler makes all features contribute equally.

Q: What is the difference between PCA and t-SNE?
A: PCA is linear, fast, deterministic, preserves global structure — good for preprocessing and denoising. t-SNE is non-linear, slow, stochastic, preserves local structure — only for 2D/3D visualisation of clusters. Never use t-SNE as preprocessing for ML models.

Q: If PCA reduces 100 features to 10, what are those 10?
A: They are linear combinations of the original 100 features. Each component is a direction (vector) in the original feature space that captures the most remaining variance.

Q: How does PCA help prevent the curse of dimensionality?
A: With many features, data points become sparse in the high-dimensional space and distances become meaningless. PCA compresses to fewer dimensions where data is denser and distances are more meaningful.

🎥 PCA (StatQuest, BEST explanation): https://www.youtube.com/watch?v=FgakZw6K1QQ
🎥 t-SNE explained: https://www.youtube.com/watch?v=NEaUSP4YerM
📚 UMAP documentation: https://umap-learn.readthedocs.io/
📚 Sklearn PCA: https://scikit-learn.org/stable/modules/decomposition.html`,

"model-evaluation": `━━━ WHY DOES MODEL EVALUATION MATTER? ━━━

BACKDROP — The Problem Without Proper Evaluation:
A cancer detection model achieved 99% accuracy. Sounds amazing.
The dataset had 99% non-cancer cases. The model learned to always predict "no cancer." Never correct on the 1% that actually had cancer.
Accuracy alone is lying to you. This is why model evaluation is an entire discipline.

━━━ METRICS FOR CLASSIFICATION ━━━

Confusion Matrix:
  Predicted:    No       Yes
  Actual No:    TN       FP    (FP = false alarm)
  Actual Yes:   FN       TP    (FN = missed detection)

  Accuracy   = (TP + TN) / (TP + TN + FP + FN)   ← misleading with imbalance
  Precision  = TP / (TP + FP)   ← of all I said "yes", how many were actually yes?
  Recall     = TP / (TP + FN)   ← of all actual "yes", how many did I catch?
  F1 Score   = 2 × (Precision × Recall) / (Precision + Recall)   ← balanced

WHEN TO PRIORITISE:
  High Recall:     Cancer detection — catch every case, even false alarms OK
  High Precision:  Spam filter — never mark real email as spam
  F1:              Fraud detection — balance both

ROC-AUC:
  Plots True Positive Rate vs False Positive Rate at every threshold.
  AUC = 0.5: random. AUC = 1.0: perfect. Good = > 0.85.

  from sklearn.metrics import classification_report, roc_auc_score
  print(classification_report(y_test, y_pred))
  print("AUC:", roc_auc_score(y_test, model.predict_proba(X_test)[:,1]))

━━━ METRICS FOR REGRESSION ━━━

  MAE  = mean(|y_pred - y_actual|)           — in same units as target, robust to outliers
  MSE  = mean((y_pred - y_actual)²)          — penalises large errors heavily
  RMSE = √MSE                                — in same units as target
  R²   = 1 - (SS_res / SS_tot)               — 1 = perfect, 0 = predicts just the mean

━━━ CROSS-VALIDATION (THE CORRECT WAY TO EVALUATE) ━━━

Never evaluate on training data. Never evaluate once on a single test split.
Use K-Fold Cross-Validation: split data into K folds, train on K-1 folds, evaluate on 1, rotate K times.

  from sklearn.model_selection import cross_val_score
  scores = cross_val_score(model, X, y, cv=5, scoring="f1")
  print(f"F1: {scores.mean():.3f} ± {scores.std():.3f}")

StratifiedKFold: preserves class proportions in each fold (use for imbalanced classification).

━━━ OVERFITTING vs UNDERFITTING ━━━

  Underfitting (high bias):   train error HIGH, val error HIGH
  Good fit:                   train error LOW, val error LOW (similar)
  Overfitting (high variance): train error LOW, val error HIGH

Fix overfitting: regularisation, more data, simpler model, dropout (neural nets).
Fix underfitting: more complex model, more features, longer training.

━━━ HYPERPARAMETER TUNING ━━━

GridSearchCV: try all combinations (exhaustive, slow).
RandomizedSearchCV: sample N random combinations (faster, nearly as good for large spaces).

  from sklearn.model_selection import RandomizedSearchCV
  param_dist = {"n_estimators": [100,200,300], "max_depth": [4,6,8,10]}
  search = RandomizedSearchCV(rf, param_dist, n_iter=20, cv=3, scoring="roc_auc")
  search.fit(X_train, y_train)
  print(search.best_params_)

━━━ REAL-WORLD EXAMPLES ━━━

• Google Ads: A/B test + statistical significance test before any model is promoted to production.
• Amazon Recommendations: Offline AUC + online A/B test measuring actual click-through rate. Both needed.
• Medical AI (FDA): Models predicting disease must report sensitivity (recall) + specificity for each threshold.
• Kaggle: Leaderboard score on public test set. But top competitors also monitor private leaderboard gap to detect overfitting.

━━━ INTERVIEW QUESTIONS ━━━

Q: What is data leakage and how does it cause misleadingly good evaluation scores?
A: Data leakage = information from the test/future leaking into training. Common forms: scaling on full dataset before split, using future data in time series, target leakage (feature correlated with target post-fact). Always fit transformers (scalers, encoders) on train data ONLY.

Q: What is the difference between validation set and test set?
A: Validation set: used during development to tune hyperparameters. Test set: held out completely until final evaluation. If you tune on the test set, you are overfitting to it.

Q: How do you handle class imbalance?
A: Resample (SMOTE oversampling or undersampling), use class_weight="balanced", use precision-recall AUC instead of ROC-AUC, adjust decision threshold.

Q: What is the bias-variance tradeoff?
A: Bias = error from wrong model assumptions (underfitting). Variance = error from model being too sensitive to training data (overfitting). Complex models have low bias, high variance. Simple models have high bias, low variance. Goal: find the sweet spot.

🎥 Cross-validation (StatQuest): https://www.youtube.com/watch?v=fSytzGwwBVw
🎥 ROC AUC (StatQuest): https://www.youtube.com/watch?v=4jRBRDbJemM
📚 Sklearn metrics: https://scikit-learn.org/stable/modules/model_evaluation.html`,

"data-preprocessing": `━━━ WHY IS DATA PREPROCESSING THE MOST IMPORTANT STEP? ━━━

BACKDROP — The Rule in Industry:
"Garbage in, garbage out." A perfect model trained on dirty data gives garbage predictions.
In practice, data scientists spend 60-80% of their time on data cleaning and preprocessing — not on model building.
Real-world data always has: missing values, wrong types, outliers, inconsistent categories, different scales.

━━━ MISSING VALUES ━━━

  import pandas as pd
  df.isnull().sum()               # count nulls per column

Strategy depends on WHY data is missing:
  Simple imputation:
    df["age"].fillna(df["age"].median())        # numerical: median (robust to outliers)
    df["city"].fillna(df["city"].mode()[0])     # categorical: most common value

  Advanced imputation (sklearn):
    from sklearn.impute import SimpleImputer, KNNImputer
    imp = KNNImputer(n_neighbors=5)             # fill with weighted average of K nearest rows
    X_filled = imp.fit_transform(X)

  When to DROP rows: if a row has > 50% missing values.
  When to DROP column: if a column has > 40% missing values and low importance.

━━━ ENCODING CATEGORICAL FEATURES ━━━

Models need numbers, not strings. Two main approaches:

  Label Encoding: maps categories to integers. Only for ordinal categories (small < medium < large).
    from sklearn.preprocessing import LabelEncoder
    df["size"] = LabelEncoder().fit_transform(df["size"])

  One-Hot Encoding: creates a binary column per category. For nominal categories (city names).
    df = pd.get_dummies(df, columns=["city"], drop_first=True)
    # Or:
    from sklearn.preprocessing import OneHotEncoder
    enc = OneHotEncoder(sparse=False, handle_unknown="ignore")

  Warning: with 1000 categories (zip codes), one-hot creates 1000 columns (high cardinality).
  Use: Target Encoding or Embeddings for high-cardinality categoricals.

━━━ FEATURE SCALING ━━━

Required by: Linear Regression, Logistic Regression, SVM, KNN, Neural Networks, PCA.
NOT required by: Decision Trees, Random Forest, XGBoost (split-based, scale-invariant).

  StandardScaler: mean=0, std=1. Best default.
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)     # ONLY fit on train!
    X_test_scaled  = scaler.transform(X_test)          # transform test with same scaler

  MinMaxScaler: scales to [0, 1]. Good for image pixels, neural net inputs.
  RobustScaler: uses median and IQR — robust to outliers.

━━━ OUTLIER DETECTION & TREATMENT ━━━

  # Z-score method
  from scipy import stats
  z = np.abs(stats.zscore(df[["age", "income"]]))
  df_clean = df[(z < 3).all(axis=1)]    # remove rows where any feature is 3+ std devs away

  # IQR method
  Q1 = df["income"].quantile(0.25)
  Q3 = df["income"].quantile(0.75)
  IQR = Q3 - Q1
  df_clean = df[df["income"].between(Q1 - 1.5*IQR, Q3 + 1.5*IQR)]

━━━ FEATURE ENGINEERING ━━━

Creating new features from existing ones often improves model performance more than algorithm choice.

  df["age_squared"] = df["age"] ** 2               # polynomial feature
  df["price_per_sqft"] = df["price"] / df["sqft"]  # ratio feature
  df["month"] = pd.to_datetime(df["date"]).dt.month # temporal feature
  df["is_weekend"] = df["day_of_week"].isin([5,6])  # binary flag

━━━ PIPELINES (Production-Grade Preprocessing) ━━━

  from sklearn.pipeline import Pipeline
  from sklearn.preprocessing import StandardScaler
  from sklearn.ensemble import RandomForestClassifier

  pipe = Pipeline([
      ("scaler", StandardScaler()),
      ("model", RandomForestClassifier()),
  ])
  pipe.fit(X_train, y_train)          # scaler fits on train only
  pipe.predict(X_test)                # scaler auto-applies to test
  # No data leakage possible — preprocessing is part of the model

━━━ REAL-WORLD EXAMPLES ━━━

• Kaggle competition winners spend 80% of time on feature engineering. The model is almost secondary.
• Airbnb: feature engineering for price prediction — distance to city center, host response rate, photo quality score — all derived from raw data.
• Credit scoring: "months since last late payment", "ratio of credit utilised" are engineered features more predictive than raw transaction data.

━━━ INTERVIEW QUESTIONS ━━━

Q: What is data leakage in preprocessing?
A: Fitting transformers (StandardScaler, imputers, encoders) on the full dataset (train + test) before splitting. The model indirectly "sees" test data statistics during training, inflating evaluation scores. Always fit transformers on train only.

Q: When would you use median imputation instead of mean imputation?
A: When the feature has outliers. Median is robust to outliers — if income has a few billionaires, the mean would be pulled high and imputed values would be wrong for typical cases.

Q: What is target encoding?
A: Replace a categorical category with the mean of the target variable for rows with that category. E.g., "city = New York" → replace with mean house price in New York. Powerful for high-cardinality categoricals, but must be done carefully to avoid leakage (use cross-fold statistics).

Q: Why do tree models not need feature scaling?
A: Trees split on thresholds (e.g., income > 50000). The absolute scale doesn't affect which split is chosen — multiplying all values by 100 produces the same tree. Distance-based models (KNN, SVM) and gradient methods (Linear Regression, Neural Nets) do need scaling.

🎥 Feature Engineering (Kaggle Learn): https://www.kaggle.com/learn/feature-engineering
🎥 Sklearn Pipelines: https://www.youtube.com/watch?v=ywPjZj9uqFE
📚 Sklearn preprocessing: https://scikit-learn.org/stable/modules/preprocessing.html`,

"svm-knn": `━━━ WHY WERE SVM AND KNN INVENTED? ━━━

SVM BACKDROP (1992):
Before SVM, neural networks were the dominant non-linear classifier but were hard to train, prone to overfitting, and had no theoretical guarantees.
Vladimir Vapnik and Alexey Chervonenkis (Bell Labs) developed Support Vector Machine theory in the 1960s, with practical SVM (with the kernel trick) in 1992.
Key insight: find the decision boundary with the MAXIMUM margin between classes — the most geometrically robust boundary.

KNN BACKDROP (1951):
Evelyn Fix and Joe Hodges developed the first non-parametric nearest-neighbour rule in 1951.
Idea: classify a new point by the majority vote of its K closest training points.
Zero training, pure memory. Simple but surprisingly effective.

━━━ SVM — HOW IT WORKS ━━━

Find the hyperplane that maximises the margin between classes.
Support vectors = the training points closest to the decision boundary.

LINEAR SVM (linearly separable data):
  w·x + b = 0 is the decision boundary.
  Margin = 2 / ||w||. Maximise margin = minimise ||w||.

KERNEL TRICK (non-linear data):
  Map data to higher dimensions where it IS linearly separable.
  Common kernels:
    Linear:      K(x,z) = x·z              (no transformation)
    RBF:         K(x,z) = exp(-γ||x-z||²)  (most common, handles curved boundaries)
    Polynomial:  K(x,z) = (x·z + c)^d

  from sklearn.svm import SVC
  model = SVC(kernel="rbf", C=1.0, gamma="scale", probability=True)
  model.fit(X_train, y_train)

C parameter: trade-off between large margin and few misclassifications.
  Small C → large margin, tolerates some errors (underfitting risk)
  Large C → narrow margin, fits all training points (overfitting risk)

━━━ KNN — HOW IT WORKS ━━━

For a new point:
  1. Compute distance to all training points (Euclidean, Manhattan, etc.)
  2. Find the K closest training points.
  3. Predict the majority class (classification) or mean (regression).

  from sklearn.neighbors import KNeighborsClassifier
  model = KNeighborsClassifier(n_neighbors=5, metric="euclidean")
  model.fit(X_train, y_train)

Choosing K:
  Small K → complex boundary, overfits noise.
  Large K → smooth boundary, may underfit.
  Use cross-validation to find optimal K.
  Rule of thumb starting point: K = √n_training_samples.

━━━ REAL-WORLD EXAMPLES ━━━

SVM:
• Image classification pre-deep learning era: SVM with HOG features was the SOTA for face detection (Viola-Jones + SVM) until CNNs took over in 2012.
• Bioinformatics: SVM on gene expression microarray data to classify cancer types. Still used in clinical settings due to small datasets and need for interpretability.
• Text classification: SVM with TF-IDF features — still competitive with BERT for short text classification.

KNN:
• Netflix recommender (early version): find K users most similar to you → recommend what they liked.
• Credit fraud: flag transactions where K nearest historical transactions are fraud.
• Medical: classify a patient's cancer subtype based on K most similar patients in the hospital database.

━━━ BENEFITS & DISADVANTAGES ━━━

SVM Benefits:
  • Effective in high-dimensional spaces (text, genomics)
  • Works well with small datasets
  • Robust to outliers (only support vectors matter)
  • Theoretical guarantees (margin maximisation)

SVM Disadvantages:
  • Slow for large datasets (training is O(n²) to O(n³))
  • Needs careful kernel and C tuning
  • No probability output by default (set probability=True, but slow)

KNN Benefits:
  • Zero training time (lazy learner)
  • No assumptions about data distribution
  • Naturally handles multi-class
  • Adapts to data shape

KNN Disadvantages:
  • Slow prediction: O(n×d) per query (compute distance to all training points)
  • Curse of dimensionality: distances become meaningless in high dimensions
  • Requires feature scaling (distance-based!)
  • All training data must stay in memory

━━━ INTERVIEW QUESTIONS ━━━

Q: What is the kernel trick in SVM?
A: Implicitly maps data to a higher-dimensional space where classes are linearly separable, without actually computing the transformation (only the kernel function K(x,z) is computed). This makes non-linear SVM computationally feasible.

Q: What does the C parameter in SVM control?
A: Regularisation. Small C = large margin, allows misclassifications (more regularised). Large C = small margin, fits all training points (less regularised). Too large C leads to overfitting.

Q: Why does KNN require feature scaling?
A: KNN uses Euclidean distance. A feature with range 0–100,000 overwhelms one with range 0–1. StandardScaler or MinMaxScaler before KNN is mandatory.

Q: When would you choose SVM over a neural network?
A: When dataset is small (< 10K samples), high-dimensional (text, genomics), and you need theoretical guarantees. Neural networks need large datasets to shine.

Q: What is the difference between KNN for classification and regression?
A: Classification: majority vote of K neighbours. Regression: mean (or weighted mean) of K neighbours' target values. KNeighborsRegressor in sklearn.

🎥 SVM (StatQuest): https://www.youtube.com/watch?v=efR1C6CvhmE
🎥 SVM Kernel Trick: https://www.youtube.com/watch?v=Q7vT0--5VII
🎥 KNN explained: https://www.youtube.com/watch?v=HVXime0nQeI
📚 Sklearn SVM: https://scikit-learn.org/stable/modules/svm.html`,

};

let count = 0;
data.forEach(node => {
  if (updates[node.id]) {
    node.description = updates[node.id];
    count++;
  }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log(`Updated ${count} nodes.`);
