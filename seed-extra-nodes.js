// seed-extra-nodes.js  — run: node seed-extra-nodes.js
const BASE = "http://localhost:8080/api";

async function add(node) {
  const res = await fetch(BASE + "/nodes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(node),
  });
  if (!res.ok) throw new Error(`${res.status} — ${await res.text()}`);
  return res.json();
}

const nodes = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. Python vs Java Quick Reference  (under month1)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "python-java-ref",
    parentId: "month1",
    text: "Python vs Java — Quick Reference",
    description: `You already know Java. This is a direct mapping so you can write
Python immediately without unlearning Java instincts.

━━━━━ SYNTAX ━━━━━

VARIABLES:
  Java:   int x = 5;  String s = "hi";  boolean flag = true;
  Python: x = 5       s = "hi"          flag = True

NO TYPES: Python is dynamically typed — no int/String/boolean declarations.
NO SEMICOLONS. Indentation (4 spaces) replaces curly braces.

CONDITIONALS:
  Java:                       Python:
  if (x > 5) {                if x > 5:
      doSomething();               do_something()
  } else if (x == 3) {        elif x == 3:
      other();                     other()
  } else {                    else:
      fallback();                  fallback()
  }

FOR LOOPS:
  Java:   for (int i = 0; i < 10; i++) { }
  Python: for i in range(10):

  Java:   for (String item : list) { }
  Python: for item in my_list:

FUNCTIONS:
  Java:   public int add(int a, int b) { return a + b; }
  Python: def add(a, b):
              return a + b

━━━━━ COLLECTIONS ━━━━━

LIST (like Java ArrayList):
  Java:   List<Integer> lst = new ArrayList<>(Arrays.asList(1,2,3));
  Python: lst = [1, 2, 3]
  Access: lst[0]  lst[-1]  lst[1:3]  (slicing!)

DICT (like Java HashMap):
  Java:   Map<String,Integer> m = new HashMap<>();  m.put("a", 1);
  Python: m = {"a": 1, "b": 2}    m["a"]    m.get("a", default)

SET (like Java HashSet):
  Java:   Set<String> s = new HashSet<>();
  Python: s = {1, 2, 3}    s.add(4)    s & other  (intersection)

TUPLE (immutable list, no Java equivalent):
  Python: t = (1, 2, 3)    t[0]    a, b, c = t  (unpacking!)

LIST COMPREHENSION (Java streams in one line):
  Java:   list.stream().filter(x -> x > 2).map(x -> x*2).collect(...)
  Python: [x*2 for x in lst if x > 2]

━━━━━ CLASSES ━━━━━

  Java:                              Python:
  public class Animal {              class Animal:
      private String name;               def __init__(self, name):
      public Animal(String n) {              self.name = name
          this.name = n;
      }                                  def speak(self):
      public void speak() {                  print(f"I am {self.name}")
          System.out.println(name);
      }                              class Dog(Animal):  # inheritance
  }                                      def speak(self):
  class Dog extends Animal { }               super().speak()

━━━━━ KEY PYTHON FEATURES NOT IN JAVA ━━━━━

F-STRINGS (better than String.format):
  name = "World";  print(f"Hello {name}!")   → "Hello World!"

MULTIPLE RETURN VALUES:
  def minmax(lst): return min(lst), max(lst)
  lo, hi = minmax([3,1,4])

UNPACKING:
  a, b = 1, 2
  first, *rest = [1, 2, 3, 4]   # rest = [2,3,4]

WITH STATEMENT (like Java try-with-resources):
  with open("file.txt") as f:
      data = f.read()   # auto-closes

LAMBDA (same as Java lambda, shorter):
  Java:   (x) -> x * 2
  Python: lambda x: x * 2

NONE vs NULL:
  Java: null    Python: None
  Check: if x is None:  (not == None)

🎥 Python for Java Devs (quick): https://www.youtube.com/watch?v=xLovcfIugy8
📚 Python official tutorial: https://docs.python.org/3/tutorial/`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Data Preprocessing  (under month2)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "data-preprocessing",
    parentId: "month2",
    text: "Data Preprocessing",
    description: `Real-world data is messy. Preprocessing transforms raw data into something
a model can learn from. This step often determines 80% of model quality.

━━━━━ THE PIPELINE ━━━━━

  Raw Data → Handle Missing → Encode Categoricals → Scale Numerics → Split → Model

━━━━━ MISSING VALUES ━━━━━

DETECTION:
  df.isnull().sum()            # count nulls per column
  df.isnull().mean() * 100     # % missing per column

STRATEGIES:
  Drop rows:          df.dropna()
  Drop columns:       df.drop(columns=["col"])  # if >50% missing
  Fill with mean:     df["age"].fillna(df["age"].mean())
  Fill with median:   df["salary"].fillna(df["salary"].median())  # robust to outliers
  Fill with mode:     df["city"].fillna(df["city"].mode()[0])
  Forward fill:       df.fillna(method="ffill")  # for time series

  from sklearn.impute import SimpleImputer
  imp = SimpleImputer(strategy="median")
  X_clean = imp.fit_transform(X)

━━━━━ ENCODING CATEGORICAL FEATURES ━━━━━

ONE-HOT ENCODING (for nominal categories):
  City: [London, Paris, Tokyo] → [1,0,0], [0,1,0], [0,0,1]
  Use when: no ordinal relationship between categories

  pd.get_dummies(df, columns=["city"])
  from sklearn.preprocessing import OneHotEncoder

LABEL ENCODING (for ordinal categories):
  Size: [Small, Medium, Large] → [0, 1, 2]
  Use when: there IS a natural order

  from sklearn.preprocessing import LabelEncoder
  le = LabelEncoder()
  df["size"] = le.fit_transform(df["size"])

TARGET ENCODING (advanced):
  Replace category with mean of target for that category.
  Powerful but risk of data leakage — use with cross-validation.

━━━━━ FEATURE SCALING ━━━━━

WHY? Algorithms like KNN, SVM, PCA are sensitive to scale.
  Age: [20–80]  vs  Salary: [20000–200000]
  Without scaling: salary dominates the distance calculation!

STANDARDISATION (Z-score): mean=0, std=1
  x_scaled = (x - mean) / std
  Use for: SVM, PCA, Logistic Regression, Neural Networks

  from sklearn.preprocessing import StandardScaler
  scaler = StandardScaler()
  X_train_s = scaler.fit_transform(X_train)
  X_test_s  = scaler.transform(X_test)   # NEVER fit on test!

MIN-MAX SCALING: scales to [0, 1]
  x_scaled = (x - min) / (max - min)
  Use for: Neural networks (especially with sigmoid/image pixel values)

  from sklearn.preprocessing import MinMaxScaler

RULE: Always fit scaler on TRAINING data only, then transform test data.
Fitting on test data = data leakage = optimistic evaluation!

━━━━━ OUTLIERS ━━━━━

DETECTION:
  IQR method: Q1 - 1.5*IQR to Q3 + 1.5*IQR
  Z-score: |z| > 3 → outlier

HANDLING:
  Remove (if data entry error)
  Cap/clip: df["col"].clip(lower=lower_bound, upper=upper_bound)
  Use robust algorithms: Tree-based models are outlier-resistant
  Log transform: np.log1p(df["skewed_col"])  # compresses large values

━━━━━ FEATURE ENGINEERING ━━━━━

Create new features that help the model:
  Date features: extract year, month, day_of_week, is_weekend
  Interaction: col_A * col_B  or  col_A / col_B
  Polynomial: col_A², col_A³
  Binning: pd.cut(df["age"], bins=[0,18,35,60,100], labels=["child","young","adult","senior"])

━━━━━ SKLEARN PIPELINE ━━━━━

Chain all steps to prevent data leakage and simplify code:

  from sklearn.pipeline import Pipeline
  from sklearn.compose import ColumnTransformer

  numeric_pipe    = Pipeline([("imp", SimpleImputer()), ("scl", StandardScaler())])
  categoric_pipe  = Pipeline([("imp", SimpleImputer(strategy="most_frequent")),
                               ("enc", OneHotEncoder(handle_unknown="ignore"))])

  preprocessor = ColumnTransformer([
      ("num", numeric_pipe, numeric_cols),
      ("cat", categoric_pipe, cat_cols),
  ])

  model_pipe = Pipeline([("prep", preprocessor), ("clf", RandomForestClassifier())])
  model_pipe.fit(X_train, y_train)

🎥 Data Preprocessing (StatQuest): https://www.youtube.com/watch?v=0xVqLJe9_CY
🎥 Feature Engineering (Krish Naik): https://www.youtube.com/watch?v=6WDFfaYtN6s
📚 sklearn preprocessing docs: https://scikit-learn.org/stable/modules/preprocessing.html`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Gradient Boosting / XGBoost  (under supervised)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "gradient-boosting",
    parentId: "supervised",
    text: "Gradient Boosting — XGBoost & LightGBM",
    description: `Gradient Boosting builds an ensemble of WEAK learners (shallow trees)
sequentially, each correcting the errors of the previous ones.
This is the algorithm that WINS most Kaggle tabular competitions.

━━━━━ THE CORE IDEA ━━━━━

Boosting = train models one at a time, each focuses on previous errors.

Round 1: Train Tree_1 on data.           Residuals = y - ŷ_1
Round 2: Train Tree_2 on the RESIDUALS.  Residuals = y - (ŷ_1 + ŷ_2)
Round 3: Train Tree_3 on new residuals.
...
Final: ŷ = ŷ_1 + lr*ŷ_2 + lr*ŷ_3 + ...

Each new tree is fitting the GRADIENT of the loss function with respect
to the current ensemble's predictions. Hence "gradient boosting."

━━━━━ XGBOOST ━━━━━

eXtreme Gradient Boosting — fast, regularised, industry-standard.

  pip install xgboost
  from xgboost import XGBClassifier, XGBRegressor

  model = XGBClassifier(
      n_estimators=500,      # number of trees
      learning_rate=0.05,    # step size (lower = more trees needed, usually better)
      max_depth=6,           # depth of each tree
      subsample=0.8,         # fraction of rows per tree (prevents overfitting)
      colsample_bytree=0.8,  # fraction of features per tree
      reg_alpha=0.1,         # L1 regularisation
      reg_lambda=1.0,        # L2 regularisation
      use_label_encoder=False,
      eval_metric="logloss",
      random_state=42
  )

  model.fit(X_train, y_train,
      eval_set=[(X_val, y_val)],
      early_stopping_rounds=50,   # stop if no improvement for 50 rounds
      verbose=50)

  xgb.plot_importance(model)  # feature importance plot

━━━━━ LIGHTGBM ━━━━━

LightGBM (Microsoft) — often faster than XGBoost on large datasets.

  pip install lightgbm
  import lightgbm as lgb

  model = lgb.LGBMClassifier(
      n_estimators=500,
      learning_rate=0.05,
      num_leaves=31,        # controls tree complexity (LGB uses leaf-wise growth)
      min_child_samples=20,
  )

CATBOOST (Yandex): Best for categorical features — handles them natively.
  pip install catboost
  from catboost import CatBoostClassifier
  model = CatBoostClassifier(cat_features=["city","product"])

━━━━━ RANDOM FOREST vs GRADIENT BOOSTING ━━━━━

  Random Forest               Gradient Boosting
  Trees in PARALLEL           Trees in SEQUENCE
  Each tree independent       Each tree fixes previous errors
  Fast to train               Slower (sequential)
  Hard to overfit             Can overfit (tune carefully)
  Good baseline               Usually better with tuning
  Less hyperparameters        More hyperparameters

RULE OF THUMB:
  Start with Random Forest → if not good enough → try XGBoost/LightGBM.
  For most tabular problems, LightGBM + good feature engineering wins.

━━━━━ HYPERPARAMETER TUNING ━━━━━

Most important:
  learning_rate × n_estimators (reduce lr, increase n_estimators)
  max_depth (3–8 typical)
  subsample, colsample_bytree (0.6–0.9)

Use Optuna for automated search:
  pip install optuna
  import optuna

🎥 XGBoost explained (StatQuest): https://www.youtube.com/watch?v=OtD8wVaFm6E
🎥 Gradient Boosting (StatQuest): https://www.youtube.com/watch?v=3CC4N4z3GJc
📄 XGBoost paper (Chen & Guestrin, 2016): https://arxiv.org/abs/1603.02754
📚 XGBoost docs: https://xgboost.readthedocs.io/`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Generative AI — GANs & Diffusion Models  (under month3)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "generative-ai",
    parentId: "month3",
    text: "Generative AI — GANs & Diffusion Models",
    description: `Generative models GENERATE new data (images, text, audio) rather than
just classifying existing data. Powers DALL-E, Stable Diffusion, Midjourney.

━━━━━ GAN (Generative Adversarial Network) ━━━━━

Invented by Ian Goodfellow in 2014. Two networks compete:
  Generator G: takes random noise z → generates fake image G(z)
  Discriminator D: distinguishes real images from G(z)

TRAINING:
  1. Train D to say REAL for real images, FAKE for G(z)
  2. Train G to fool D into saying REAL for G(z)
  → They get better together in a minimax game!

LOSS:
  min_G max_D [E[log D(x)] + E[log(1 - D(G(z)))]]

CODE SKETCH:
  # Train discriminator
  real_loss = criterion(D(real_images), ones)
  fake_loss = criterion(D(G(z).detach()), zeros)
  d_loss = real_loss + fake_loss; d_loss.backward()

  # Train generator
  g_loss = criterion(D(G(z)), ones)  # fool D
  g_loss.backward()

FAMOUS GAN VARIANTS:
  DCGAN     (2015) — convolutional GAN, stable training
  StyleGAN  (2018/2019) — photo-realistic faces (thispersondoesnotexist.com)
  CycleGAN  (2017) — image-to-image translation (horse → zebra!)
  Pix2Pix   (2016) — conditional image translation (sketch → photo)
  BigGAN    (2018) — high-res, high-fidelity image generation

PROBLEMS WITH GANS:
  Mode collapse — G produces only a few types of outputs
  Training instability — D and G hard to keep in balance
  Hard to evaluate — no single loss number tells you quality

━━━━━ VAE (Variational Autoencoder) ━━━━━

Encoder: image → latent distribution (mean μ, variance σ)
Decoder: sample from N(μ,σ) → reconstruct image
Latent space is CONTINUOUS → smooth interpolations!

Use: image compression, anomaly detection, drug discovery (molecule generation).

━━━━━ DIFFUSION MODELS ━━━━━

Stable Diffusion, DALL-E 2/3, Midjourney, Imagen are all diffusion models.
They beat GANs on image quality and are more stable to train.

FORWARD PROCESS (noising):
  Add Gaussian noise to image progressively over T steps.
  x_T is pure noise.

REVERSE PROCESS (denoising):
  Train a neural network (U-Net) to predict and remove the noise at each step.
  Starting from noise x_T → gradually denoise → get image x_0.

CONDITIONING:
  Add text embedding to U-Net at each step → text-guided image generation!
  text → CLIP encoder → embedding → U-Net at each denoising step

LATENT DIFFUSION (Stable Diffusion):
  Run diffusion in compressed LATENT SPACE (not pixel space → much faster).
  Encode image to latent (VAE) → diffuse in latent space → decode back.

CODE (use diffusers library):
  from diffusers import StableDiffusionPipeline
  import torch

  pipe = StableDiffusionPipeline.from_pretrained("runwayml/stable-diffusion-v1-5",
                                                   torch_dtype=torch.float16)
  pipe = pipe.to("cuda")
  image = pipe("A photo of a dog on the moon").images[0]
  image.save("output.png")

━━━━━ AUTOREGRESSIVE MODELS ━━━━━

Generate data one token/pixel at a time (like GPT for text).
DALL-E 1 was autoregressive: generated image pixels one by one.
Now superseded by diffusion for images but still dominant for text (GPT).

🎥 GAN explained (Yannic Kilcher): https://www.youtube.com/watch?v=eyxmSmjmNS0
🎥 Diffusion Models explained: https://www.youtube.com/watch?v=fbLgFrlTnGU
📄 Original GAN paper (Goodfellow 2014): https://arxiv.org/abs/1406.2661
📄 Denoising Diffusion paper (Ho et al. 2020): https://arxiv.org/abs/2006.11239
📄 Stable Diffusion paper (LDM): https://arxiv.org/abs/2112.10752
🛠️ HuggingFace Diffusers library: https://huggingface.co/docs/diffusers/`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Reinforcement Learning  (under root-ai)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "reinforcement-learning",
    parentId: "root-ai",
    text: "Reinforcement Learning",
    description: `RL is the third major branch of ML alongside supervised and unsupervised.
An AGENT learns to take ACTIONS in an ENVIRONMENT to maximise cumulative REWARD.

━━━━━ KEY CONCEPTS ━━━━━

  Agent       — the learner/decision-maker (e.g. a game-playing AI)
  Environment — what the agent interacts with (e.g. the game)
  State (s)   — current situation (e.g. game screen)
  Action (a)  — what the agent can do (e.g. move left/right)
  Reward (r)  — feedback signal (+1 for win, -1 for lose, 0 otherwise)
  Policy (π)  — mapping from state to action (what the agent learns)
  Value (V)   — expected cumulative future reward from state s

RL LOOP:
  Agent observes s_t → takes action a_t → receives r_t, sees s_{t+1} → repeat.

━━━━━ KEY ALGORITHMS ━━━━━

Q-LEARNING:
  Learn Q(s,a) = expected total reward from taking action a in state s.
  Update rule: Q(s,a) ← Q(s,a) + α[r + γ·max_a Q(s',a') - Q(s,a)]
  γ = discount factor (how much to value future rewards)

DEEP Q-NETWORK (DQN — DeepMind, 2013):
  Replace Q-table with a neural network.
  Input: game screen (pixels) → Output: Q-values for each action.
  Breakthrough: played Atari games at human level!
  Tricks: experience replay, target network.

POLICY GRADIENT METHODS:
  Directly optimise the policy π_θ (parameterised by θ).
  REINFORCE algorithm: increase probability of actions that led to high reward.

PROXIMAL POLICY OPTIMISATION (PPO):
  Most widely used RL algorithm today.
  Stable, sample-efficient, works for continuous actions.
  Used to train: ChatGPT (RLHF), robots, game agents.

ACTOR-CRITIC (A3C, A2C, SAC):
  Combines policy gradient (actor) with value estimation (critic).
  Critic reduces variance of gradient estimates.

━━━━━ FAMOUS APPLICATIONS ━━━━━

  AlphaGo / AlphaZero    — beat world champions at Go, Chess, Shogi
  OpenAI Five            — beat world champions at Dota 2
  AlphaStar              — grandmaster level StarCraft 2
  ChatGPT / Claude       — RLHF makes LLMs helpful and safe
  Robotics               — teach robots to walk, grasp, manipulate
  Autonomous driving     — path planning and control
  Drug discovery         — optimise molecule properties

━━━━━ KEY CHALLENGES ━━━━━

  Sparse rewards       — many steps before any reward signal
  Sample efficiency    — need millions of environment interactions
  Exploration vs exploitation — explore new actions or exploit known good ones?
  Reward hacking       — agent finds unintended ways to maximise reward
  Credit assignment    — which past actions caused the eventual reward?

━━━━━ WHERE TO START ━━━━━

Environment: OpenAI Gymnasium (CartPole, LunarLander, Atari)
  pip install gymnasium
  import gymnasium as gym
  env = gym.make("CartPole-v1")
  obs, info = env.reset()
  obs, reward, done, truncated, info = env.step(action)

Library: Stable-Baselines3 (pre-built PPO, DQN, SAC etc.)
  pip install stable-baselines3
  from stable_baselines3 import PPO
  model = PPO("MlpPolicy", env, verbose=1)
  model.learn(total_timesteps=100_000)

🎥 RL Course (David Silver / DeepMind, classic): https://www.youtube.com/playlist?list=PLqYmG7hTraZDM-OYHWgPebj2MfCFzFObQ
🎥 RL from scratch (Phil Tabor): https://www.youtube.com/watch?v=ELE2_Mftqoc
📄 DQN paper (Mnih et al. 2013): https://arxiv.org/abs/1312.5602
📄 PPO paper (Schulman et al. 2017): https://arxiv.org/abs/1707.06347
📄 AlphaGo paper (Nature 2016): https://www.nature.com/articles/nature16961
📚 Sutton & Barto RL Book (FREE): http://incompleteideas.net/book/the-book-2nd.html`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Prompt Engineering  (under nlp)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "prompt-engineering",
    parentId: "nlp",
    text: "Prompt Engineering",
    description: `Prompt engineering is the skill of crafting inputs to LLMs to get
high-quality, reliable outputs. Essential for building LLM-powered apps.

━━━━━ CORE TECHNIQUES ━━━━━

ZERO-SHOT:
  Simply state the task — no examples.
  Prompt: "Translate this to French: Hello, how are you?"

FEW-SHOT:
  Provide examples of input → output pairs before the real task.
  Examples teach the model the format and style you want.

  Prompt:
    Review: "Great product!" → Sentiment: Positive
    Review: "Terrible quality." → Sentiment: Negative
    Review: "Arrived on time." → Sentiment:

CHAIN-OF-THOUGHT (CoT):
  Tell the model to reason step by step. Dramatically improves accuracy on
  maths, logic, and multi-step reasoning.

  Prompt: "Solve this step by step: Roger has 5 balls. He buys 2 more cans
  of 3 balls each. How many balls does he have?"

  Response: "Roger starts with 5. He buys 2×3=6 more. 5+6=11. Answer: 11."

SYSTEM PROMPT:
  Set the model's persona/role at the top of the conversation.
  "You are an expert Python tutor. Explain everything in simple terms with
  code examples. Never give lengthy theory without code."

━━━━━ ADVANCED TECHNIQUES ━━━━━

SELF-CONSISTENCY:
  Sample multiple CoT reasoning paths → take majority vote.
  Improves reliability on hard reasoning tasks.

TREE OF THOUGHT (ToT):
  Explore multiple reasoning branches simultaneously like a search tree.
  Best for planning, puzzles, complex decisions.

REACT (Reasoning + Acting):
  Interleave reasoning with tool use (search, calculator, code execution).
  Foundation for AI agents.

STRUCTURED OUTPUT:
  Force JSON output for reliable parsing:
  "Return ONLY a JSON object with keys: name, age, city. No other text."

━━━━━ PROMPT PATTERNS FOR CODE ━━━━━

  "You are a senior Python developer. Write clean, production-ready code
  with type hints and docstrings. Use snake_case."

  "First explain your approach in 2 sentences. Then write the code.
  Then add 3 test cases."

  "Review this code for bugs, performance issues, and security vulnerabilities.
  Return findings as a JSON list."

━━━━━ CONTEXT WINDOW MANAGEMENT ━━━━━

  Context window = total tokens the model can see at once.
  GPT-4: 128K tokens (~96K words)
  Claude Sonnet: 200K tokens

  For long documents: chunk → embed → retrieve → inject relevant chunks (RAG).

━━━━━ OPENAI API USAGE ━━━━━

  from openai import OpenAI
  client = OpenAI(api_key="...")

  response = client.chat.completions.create(
      model="gpt-4o",
      messages=[
          {"role": "system", "content": "You are a helpful coding assistant."},
          {"role": "user",   "content": "Write a Python binary search function."}
      ],
      temperature=0.2,    # lower = more deterministic
      max_tokens=1000,
  )
  print(response.choices[0].message.content)

  temperature=0   → deterministic, best for factual tasks
  temperature=0.7 → creative, good for writing
  temperature=1.0 → very random

📄 Chain-of-Thought paper (Wei et al. 2022): https://arxiv.org/abs/2201.11903
📄 Tree of Thought paper: https://arxiv.org/abs/2305.10601
📄 ReAct paper: https://arxiv.org/abs/2210.03629
🎥 Prompt Engineering Guide (Andrew Ng short course): https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/
📚 Prompt Engineering Guide: https://www.promptingguide.ai/`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 7. Vector Databases & RAG  (under nlp)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "vector-db-rag",
    parentId: "nlp",
    text: "Vector Databases & RAG",
    description: `RAG (Retrieval-Augmented Generation) lets LLMs answer questions about
YOUR private documents without fine-tuning. The foundation of enterprise AI.

━━━━━ THE PROBLEM RAG SOLVES ━━━━━

LLMs have a knowledge cutoff and can't access your private data:
  • Your company's internal docs
  • Recent news/research
  • Personal files, emails, code repos

RAG solves this by injecting relevant context at query time.

━━━━━ HOW RAG WORKS ━━━━━

  INDEXING (one-time):
    1. Load documents (PDFs, docs, web pages)
    2. Chunk into smaller pieces (500–1000 tokens each)
    3. Embed each chunk → dense vector (using embedding model)
    4. Store vectors in a vector database

  RETRIEVAL (at query time):
    5. User asks a question
    6. Embed the question → vector
    7. Find K most similar document chunks (cosine similarity)
    8. Retrieve those chunks

  GENERATION:
    9. Prepend retrieved chunks to the LLM prompt
    10. LLM generates answer GROUNDED IN the retrieved context

━━━━━ EMBEDDINGS ━━━━━

Text → dense vector (1536 dimensions for OpenAI's ada-002).
Similar text → similar vectors (small cosine distance).
This is how we search by MEANING, not keyword.

  from openai import OpenAI
  client = OpenAI()
  response = client.embeddings.create(
      input="What is gradient descent?",
      model="text-embedding-3-small"
  )
  vector = response.data[0].embedding   # list of 1536 floats

Free alternative:
  from sentence_transformers import SentenceTransformer
  model = SentenceTransformer("all-MiniLM-L6-v2")
  embedding = model.encode("What is gradient descent?")

━━━━━ VECTOR DATABASES ━━━━━

Store and search millions of vectors efficiently.

  Chroma  — lightweight, local, great for prototyping (100% Python)
  Pinecone— managed cloud service, production-scale
  Weaviate— open-source, multi-modal
  FAISS   — Facebook AI library, very fast, local, no persistence built-in
  Qdrant  — Rust-based, fast, open-source

CODE (ChromaDB + sentence-transformers):

  import chromadb
  from sentence_transformers import SentenceTransformer

  embed_model = SentenceTransformer("all-MiniLM-L6-v2")
  client = chromadb.Client()
  collection = client.create_collection("my_docs")

  # Index documents
  docs = ["Gradient descent is...", "Neural networks are..."]
  ids  = ["doc1", "doc2"]
  vecs = embed_model.encode(docs).tolist()
  collection.add(documents=docs, embeddings=vecs, ids=ids)

  # Query
  q_vec = embed_model.encode(["How do models learn?"]).tolist()
  results = collection.query(query_embeddings=q_vec, n_results=3)
  print(results["documents"])

━━━━━ LANGCHAIN (RAG framework) ━━━━━

  pip install langchain langchain-openai chromadb
  from langchain.chains import RetrievalQA
  from langchain_openai import OpenAI, OpenAIEmbeddings
  from langchain.vectorstores import Chroma

  vectorstore = Chroma.from_documents(docs, OpenAIEmbeddings())
  qa = RetrievalQA.from_chain_type(llm=OpenAI(), retriever=vectorstore.as_retriever())
  answer = qa.invoke("What is backpropagation?")

━━━━━ WHEN TO USE RAG vs FINE-TUNING ━━━━━

  RAG: best for knowledge injection (your docs, dynamic data)
  Fine-tuning: best for style, format, or task-specific behaviour

📄 RAG paper (Lewis et al. 2020): https://arxiv.org/abs/2005.11401
🎥 RAG explained (Andrej Karpathy-style): https://www.youtube.com/watch?v=T-D1OfcDW1M
🛠️ ChromaDB: https://docs.trychroma.com/
🛠️ LangChain RAG tutorial: https://python.langchain.com/docs/tutorials/rag/`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 8. How to Read ML Research Papers  (under projects)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "reading-papers",
    parentId: "projects",
    text: "How to Read ML Research Papers",
    description: `Being able to read and implement papers is what separates good ML engineers
from great ones. Most cutting-edge techniques appear in papers 1-2 years
before any tutorial exists.

━━━━━ THE 3-PASS METHOD ━━━━━

PASS 1 — Survey (5–10 min):
  Read: Title, Abstract, Introduction, Conclusion, figures.
  Decide: Is this paper relevant to me? Should I read it fully?
  Answer: What problem does this solve? What are the main results?

PASS 2 — Understand (1–2 hrs):
  Read everything except the math proofs.
  Focus on: Method section, architecture diagrams, experiments.
  Understand: What is the proposed approach? How is it better?

PASS 3 — Reproduce (1–7 days):
  Read the full paper including math.
  Try to implement the key ideas from scratch.
  This is where real understanding comes from.

━━━━━ PAPER STRUCTURE ━━━━━

  Abstract      — 1 paragraph summary of the whole paper
  Introduction  — problem, why it matters, what they propose
  Related Work  — how this differs from prior work
  Method        — the actual technical contribution (most important!)
  Experiments   — results on benchmarks, ablation studies
  Conclusion    — summary + future work
  Appendix      — proofs, extra experiments (often can skip)

━━━━━ WHERE TO FIND PAPERS ━━━━━

  arXiv: https://arxiv.org/ (preprints, free, immediate)
  Papers With Code: https://paperswithcode.com/ (papers + code + benchmarks)
  Semantic Scholar: https://www.semanticscholar.org/
  Google Scholar: https://scholar.google.com/

HOW TO FIND WHAT'S RELEVANT:
  Twitter/X — ML researchers post papers daily (@karpathy, @ylecun, @goodfellow_ian)
  HuggingFace daily papers: https://huggingface.co/papers
  Arxiv Sanity Preserver: https://arxiv-sanity-lite.com/

━━━━━ KEY PAPERS TO READ (in order) ━━━━━

FOUNDATIONS:
  Attention Is All You Need (Transformers, 2017): https://arxiv.org/abs/1706.03762
  BERT (2018): https://arxiv.org/abs/1810.04805
  GPT-2 (2019): https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf
  ResNet (2015): https://arxiv.org/abs/1512.03385

MODERN LLMs:
  GPT-3 (2020): https://arxiv.org/abs/2005.14165
  InstructGPT / RLHF (2022): https://arxiv.org/abs/2203.02155
  LoRA (2021): https://arxiv.org/abs/2106.09685
  LLaMA 2 (2023): https://arxiv.org/abs/2307.09288

GENERATIVE:
  Original GAN (2014): https://arxiv.org/abs/1406.2661
  DDPM Diffusion (2020): https://arxiv.org/abs/2006.11239

━━━━━ TIPS FROM PRACTITIONERS ━━━━━

  Read the code, not just the paper.
  Most papers now release code on GitHub — run it first, then read.
  Papers With Code links papers to their official implementations.

  Focus on understanding the KEY IDEA, not every equation.
  Ask: "What one idea makes this paper work?"

  Watch paper review videos first for complex papers.
  Channels: Yannic Kilcher, Two Minute Papers, AI Coffee Break.

  Keep a reading log: paper title, date read, key idea, code link.

🎥 How to read ML papers (Andrej Karpathy): https://www.youtube.com/watch?v=733m6qBH-jI
🎥 Yannic Kilcher paper reviews: https://www.youtube.com/c/YannicKilcher
🎥 Two Minute Papers (research summaries): https://www.youtube.com/c/K%C3%A1rolyZsolnai-Feh%C3%A9r
📚 Papers With Code: https://paperswithcode.com/`,
  },
];

async function seed() {
  console.log(`\nAdding ${nodes.length} new nodes...\n`);
  let ok = 0, fail = 0;
  for (const n of nodes) {
    try {
      await add(n);
      console.log(`  ✓  ${n.text}`);
      ok++;
    } catch (e) {
      console.error(`  ✗  ${n.text}  →  ${e.message}`);
      fail++;
    }
  }
  console.log(`\nDone — ${ok} added, ${fail} failed.\n`);
}

seed();
