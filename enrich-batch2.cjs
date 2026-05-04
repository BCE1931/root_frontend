// Batch 2: Deep Learning nodes
const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "src", "defaultData.json");
const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

const updates = {

"nn-basics": `━━━ WHY WERE NEURAL NETWORKS INVENTED? ━━━

BACKDROP — The Problem Before:
Classical ML (SVM, Decision Trees) required hand-crafted features.
To recognise a cat in a photo, you had to manually write: "find whiskers, triangular ears, slit pupils..."
This was called "feature engineering" and it was the bottleneck — experts spent years writing rules.
Researchers wanted a model that could LEARN features automatically from raw data.

HISTORY:
• McCulloch & Pitts (1943): First mathematical neuron model.
• Rosenblatt (1958): Perceptron — single-layer neuron network that could learn.
• Minsky & Papert (1969): Proved perceptrons cannot solve XOR. AI winter began.
• Rumelhart, Hinton, Williams (1986): Backpropagation — multi-layer networks can learn complex functions. Revolution.
• LeCun (1998): Convolutional Neural Nets — recognise handwritten digits. MNIST benchmark.
• Hinton et al. (2012): AlexNet wins ImageNet by 10%+ margin. Deep learning era begins.

━━━ HOW A NEURAL NETWORK WORKS ━━━

A neural net is a stack of LAYERS. Each layer transforms its input:
  output = activation(W @ input + b)

Layers:
  Input layer   → receives raw data (pixels, numbers, token IDs)
  Hidden layers → learn intermediate representations (edges, textures, patterns)
  Output layer  → final prediction (class probabilities via softmax)

  import torch
  import torch.nn as nn

  class SimpleNet(nn.Module):
      def __init__(self):
          super().__init__()
          self.fc1 = nn.Linear(784, 256)   # 784 pixels → 256 neurons
          self.fc2 = nn.Linear(256, 128)
          self.fc3 = nn.Linear(128, 10)    # 10 output classes

      def forward(self, x):
          x = torch.relu(self.fc1(x))
          x = torch.relu(self.fc2(x))
          return self.fc3(x)              # raw logits (apply softmax for probs)

ACTIVATION FUNCTIONS:
  ReLU: max(0, x) — the default. Fast, prevents vanishing gradients.
  Sigmoid: 1/(1+e^-x) — output 0-1. Only for binary output.
  Softmax: e^xi / Σe^xj — converts logits to probability distribution over classes.
  Tanh: output -1 to 1. Used in RNNs.

TRAINING LOOP:
  for epoch in range(100):
      optimizer.zero_grad()           # clear gradients from last step
      outputs = model(X_train)        # forward pass
      loss = criterion(outputs, y_train)  # compute loss
      loss.backward()                 # backprop: compute all gradients
      optimizer.step()                # update weights using gradients

━━━ BACKPROPAGATION ━━━

The learning algorithm that makes neural networks work.
1. Forward pass: compute output and loss.
2. Backward pass: using chain rule, compute gradient of loss w.r.t. every weight.
3. Update: w = w - lr × gradient.

PyTorch does step 2 automatically with loss.backward().

━━━ REAL-WORLD EXAMPLES ━━━

• Google Translate: 100+ language pairs, 500M+ users/day. Multi-layer transformer neural network.
• Apple Siri: Speech recognition uses deep recurrent neural network to convert audio to text.
• Tesla FSD (Full Self-Driving): 8-camera neural net processes frames in realtime; hidden layers learn to detect lanes, pedestrians, traffic lights from pixel data alone.
• Gmail spam filter (deep version): LSTM-based network processes email sequence, dramatically reducing spam compared to old logistic regression.
• DeepMind AlphaFold2: Neural network predicts 3D protein structure — solved a 50-year biology problem in 2020.

━━━ BENEFITS ━━━

• Learns features automatically from raw data (no manual feature engineering)
• Universal function approximator — can theoretically learn any function
• Scales with data — more data = better performance
• Transfer learning: pre-trained weights reusable across tasks

━━━ DISADVANTAGES ━━━

• Needs large amounts of labelled data
• Computationally expensive (needs GPU)
• Black box — hard to explain predictions
• Hyperparameter-sensitive (architecture, lr, batch size, optimiser)
• Training instability (vanishing/exploding gradients)

━━━ WHAT SOLVED THOSE DISADVANTAGES ━━━

• Batch Normalisation (2015): stabilises training, allows deeper networks
• Dropout (2012): randomly drop neurons during training — prevents overfitting
• Residual connections / Skip connections (ResNet, 2015): solved vanishing gradients in very deep nets
• Adam optimiser (2014): adaptive learning rate per parameter — much better than plain SGD
• Transfer learning: pre-train on 1B images, fine-tune on small dataset

━━━ INTERVIEW QUESTIONS ━━━

Q: What is the vanishing gradient problem?
A: In deep networks, gradients get multiplied through many layers via chain rule. With sigmoid/tanh activations (output 0-1), gradients shrink exponentially → early layers barely update. Fix: ReLU activations (gradient = 1 when active), batch norm, residual connections.

Q: Why do we use ReLU instead of sigmoid in hidden layers?
A: ReLU (max(0,x)) has gradient = 1 when x > 0, never shrinks — no vanishing gradients. Sigmoid saturates near 0 or 1 with gradient ~0. Dying ReLU (gradient = 0 for x < 0) fixed by Leaky ReLU.

Q: What does batch size affect during training?
A: Small batch (16-32): noisy gradient estimates, acts as regularisation, slower per epoch but can generalise better. Large batch (512+): stable gradient, faster per epoch, but can converge to sharp minima (overfits). Standard: 32-256.

Q: What is dropout and what problem does it solve?
A: During training, randomly zero out a fraction (e.g., 20-50%) of neurons. Forces network to not rely on specific neurons → more robust. Reduces overfitting. At inference, dropout is disabled.

Q: What is the difference between parameters and hyperparameters?
A: Parameters (weights, biases): learned from data via backpropagation. Hyperparameters (learning rate, number of layers, batch size, dropout rate): set by the practitioner before training — not learned.

🎥 3Blue1Brown Neural Networks (ESSENTIAL, visual): https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi
🎥 Neural Networks from Scratch (Sentdex): https://www.youtube.com/playlist?list=PLQVvvaa0QuDcjD5BAebMuxqi-rkg2KFIY
📚 CS231n Stanford (free): https://cs231n.github.io/
📚 Deep Learning Book (Goodfellow): https://www.deeplearningbook.org/`,

"pytorch": `━━━ WHY WAS PYTORCH INVENTED? ━━━

BACKDROP — The Problem Before:
TensorFlow (2015, Google) used "static computation graphs" — you had to define the entire network structure before running any data through it. Debugging was painful, felt nothing like normal Python.
Facebook AI Research (FAIR) released PyTorch in 2016 with "dynamic computation graphs" — the graph is built as code runs, making it feel like pure Python. Debug with pdb, print tensors mid-forward-pass.
By 2020, PyTorch overtook TensorFlow in research papers. Today ~85% of top ML papers use PyTorch.

━━━ CORE CONCEPTS ━━━

TENSOR: Multi-dimensional array (like NumPy ndarray but can live on GPU + has autograd).
  import torch

  t = torch.tensor([[1.0, 2.0], [3.0, 4.0]])
  t.shape          # torch.Size([2, 2])
  t.dtype          # torch.float32
  t.device         # cpu or cuda:0

  # Move to GPU:
  device = "cuda" if torch.cuda.is_available() else "cpu"
  t = t.to(device)

  # NumPy bridge:
  arr = t.cpu().numpy()           # tensor → NumPy
  t2 = torch.from_numpy(arr)      # NumPy → tensor

AUTOGRAD — automatic differentiation:
  x = torch.tensor(3.0, requires_grad=True)
  y = x ** 3
  y.backward()                    # compute dy/dx automatically
  print(x.grad)                   # tensor(27.)   — d(x³)/dx = 3x², at x=3: 27

━━━ BUILDING A MODEL ━━━

  import torch.nn as nn
  import torch.optim as optim

  class LinearNet(nn.Module):
      def __init__(self, in_dim, out_dim):
          super().__init__()
          self.net = nn.Sequential(
              nn.Linear(in_dim, 128),
              nn.ReLU(),
              nn.Dropout(0.3),
              nn.Linear(128, out_dim)
          )

      def forward(self, x):
          return self.net(x)

  model = LinearNet(784, 10).to(device)
  optimizer = optim.Adam(model.parameters(), lr=1e-3)
  criterion = nn.CrossEntropyLoss()

━━━ TRAINING LOOP (memorise this pattern) ━━━

  for epoch in range(num_epochs):
      model.train()                           # enable dropout, batch norm train mode
      for X_batch, y_batch in train_loader:
          X_batch, y_batch = X_batch.to(device), y_batch.to(device)
          optimizer.zero_grad()               # clear old gradients
          logits = model(X_batch)             # forward pass
          loss = criterion(logits, y_batch)   # compute loss
          loss.backward()                     # backprop
          optimizer.step()                    # update weights

      model.eval()                            # disable dropout, batch norm eval mode
      with torch.no_grad():                   # no gradient tracking = faster
          val_loss = criterion(model(X_val), y_val)

━━━ DATA LOADING ━━━

  from torch.utils.data import Dataset, DataLoader

  class MyDataset(Dataset):
      def __init__(self, X, y):
          self.X = torch.FloatTensor(X)
          self.y = torch.LongTensor(y)

      def __len__(self): return len(self.X)

      def __getitem__(self, idx): return self.X[idx], self.y[idx]

  loader = DataLoader(MyDataset(X_train, y_train), batch_size=32, shuffle=True)

━━━ REAL-WORLD EXAMPLES ━━━

• Meta (Facebook): PyTorch is Facebook AI's internal framework. Used for content recommendation, feed ranking, image tagging (DeepFace).
• OpenAI: GPT-3, GPT-4 trained in PyTorch (with custom distributed training on thousands of GPUs).
• Tesla FSD: Runs PyTorch models (compiled to TorchScript/ONNX) on inference chips.
• Hugging Face: All 100,000+ pre-trained models in Transformers library are PyTorch-native.
• Stability AI: Stable Diffusion image generation runs in PyTorch.

━━━ INTERVIEW QUESTIONS ━━━

Q: What is the difference between model.train() and model.eval()?
A: model.train() enables Dropout (randomly zeros neurons) and BatchNorm in training mode (uses batch statistics). model.eval() disables Dropout (uses all neurons) and BatchNorm in eval mode (uses running statistics). ALWAYS call model.eval() before inference.

Q: Why must optimizer.zero_grad() be called before loss.backward()?
A: PyTorch accumulates gradients by default — loss.backward() ADDS to existing gradients. If you don't zero them, gradients from previous batch corrupt the current batch's update.

Q: What is the difference between torch.no_grad() and model.eval()?
A: torch.no_grad() turns off gradient computation entirely (faster memory, no backprop). model.eval() switches layer behaviour (dropout off, batch norm uses running stats). Use both together during inference.

Q: What is a DataLoader and why use it?
A: DataLoader wraps a Dataset and handles batching, shuffling, and multi-process loading. shuffle=True prevents the model from memorising batch order. num_workers > 0 uses multiple CPU processes to load data in parallel while GPU trains.

Q: What is torch.save() and how do you checkpoint a model?
A: torch.save(model.state_dict(), "model.pth") saves weights only (not architecture). Load with model.load_state_dict(torch.load("model.pth")). Save state_dict + optimizer state + epoch for full checkpointing.

🎥 PyTorch Official Tutorials: https://pytorch.org/tutorials/
🎥 PyTorch for Deep Learning (freeCodeCamp): https://www.youtube.com/watch?v=V_xro1bcAuA
📚 PyTorch Lightning (cleaner training loop): https://lightning.ai/docs/pytorch/stable/
📚 PyTorch documentation: https://pytorch.org/docs/stable/`,

"cnn": `━━━ WHY WERE CNNs INVENTED? ━━━

BACKDROP — The Problem Before:
Fully-connected neural networks applied to images have catastrophic scaling problems.
A 224×224 RGB image = 224×224×3 = 150,528 input values.
A single hidden layer of 1000 neurons = 150M parameters for ONE layer.
More parameters = more training data needed + slower + severe overfitting.

And fully-connected layers treat pixel (0,0) and pixel (223,223) as equally related.
But in images, NEARBY pixels are related. A cat's face is a local pattern, not spread across the whole image.

Yann LeCun (1989, published 1998) invented Convolutional Neural Networks: small filters that slide across the image, sharing weights — massively reducing parameters and exploiting spatial locality.
In 2012, AlexNet (LeCun's ideas + deep learning + GPU training) won ImageNet competition by 10% — the moment deep learning took over AI.

━━━ HOW CNNs WORK ━━━

CONVOLUTION OPERATION:
  A small filter (e.g., 3×3 matrix) slides across the image.
  At each position: element-wise multiply filter × patch, sum → single value.
  Each filter learns ONE visual feature: edges, curves, textures.

  import torch.nn as nn

  conv_layer = nn.Conv2d(
      in_channels=3,      # input: 3 (RGB)
      out_channels=64,    # learn 64 different filters
      kernel_size=3,      # 3×3 filter
      padding=1           # pad edges to preserve spatial size
  )

CNN ARCHITECTURE:
  Input image → [Conv → BatchNorm → ReLU] × N → Pooling → Flatten → Dense → Output

  class SimpleCNN(nn.Module):
      def __init__(self):
          super().__init__()
          self.features = nn.Sequential(
              nn.Conv2d(3, 32, 3, padding=1),
              nn.BatchNorm2d(32),
              nn.ReLU(),
              nn.MaxPool2d(2),          # halve spatial dimensions
              nn.Conv2d(32, 64, 3, padding=1),
              nn.ReLU(),
              nn.AdaptiveAvgPool2d(1),  # global average pooling
          )
          self.classifier = nn.Linear(64, 10)

      def forward(self, x):
          x = self.features(x)
          x = x.view(x.size(0), -1)    # flatten
          return self.classifier(x)

POOLING:
  MaxPool2d(2): take maximum of each 2×2 patch. Halves spatial size. Keeps strongest activations.
  Purpose: reduce computation + translation invariance.

WHAT LAYERS LEARN (hierarchy):
  Early layers:  edges, corners, colour gradients
  Middle layers: textures, patterns, curves
  Deep layers:   object parts (wheels, eyes, windows)
  Final layers:  whole objects (car, cat, person)

━━━ FAMOUS ARCHITECTURES ━━━

  LeNet-5 (1998):     7 layers. Handwritten digit recognition. The original.
  AlexNet (2012):     8 layers. First deep CNN to win ImageNet. Started the revolution.
  VGGNet (2014):      16-19 layers. Simple 3×3 convolutions stacked deep.
  ResNet (2015):      50-152 layers. Residual connections — first to go truly deep without vanishing gradients.
  EfficientNet (2019): Scales width, depth, resolution together. Best accuracy-per-FLOP.

  # Load pretrained ResNet50 from torchvision:
  from torchvision import models
  model = models.resnet50(pretrained=True)

━━━ REAL-WORLD EXAMPLES ━━━

• Tesla FSD: 8 cameras on every car → CNN processes each frame → detects lanes, pedestrians, traffic signs, vehicles. Run at 36 fps on custom FSD chip.
• Google Photos: Face recognition + object tagging on 4 trillion photos using CNN.
• Medical AI (FDA-approved): CNN reads chest X-rays for pneumonia, retinal scans for diabetic retinopathy. Outperforms average radiologist on specific tasks.
• Instagram Explore: CNN extracts image features → used in recommendation engine.
• Security cameras (CCTV): CNN-based object detection identifies suspicious activity in real-time.

━━━ BENEFITS ━━━

• Massively fewer parameters than dense layers (weight sharing across positions)
• Automatically learns hierarchical visual features
• Translation invariant (a cat in the corner = cat in the centre, same features fire)
• Pre-trained on ImageNet → transfer learning to any image task

━━━ DISADVANTAGES ━━━

• Needs large labelled datasets (ImageNet = 1.2M labelled images)
• Computationally expensive (needs GPU)
• Poor at modelling long-range spatial dependencies
• Not good for non-spatial data (tables, text)

━━━ WHAT SOLVED THOSE DISADVANTAGES ━━━

• Transfer learning: pre-train ResNet/EfficientNet on ImageNet, fine-tune on your 1000 images
• Vision Transformers (ViT, 2020): self-attention captures global relationships CNNs miss
• Data augmentation: artificially increase dataset (flip, rotate, crop, colour jitter)

━━━ INTERVIEW QUESTIONS ━━━

Q: What is the purpose of padding in convolution?
A: Without padding, each conv layer shrinks spatial dimensions. Padding (zeros around border) preserves spatial size — same-sized output as input. Allows building deeper networks.

Q: What does MaxPool do and why is it used?
A: Takes maximum value in each NxN window — reduces spatial size (and computation), introduces slight translation invariance, keeps most activated (informative) features.

Q: What is a receptive field?
A: The region of the input image a single neuron in a deep layer "sees." Increases with depth: a 3×3 conv after another 3×3 conv sees a 5×5 area of the input. Deeper = larger receptive field = sees bigger patterns.

Q: Why are CNNs better than dense layers for images?
A: Three reasons: (1) weight sharing — same filter scans entire image, fewer parameters; (2) local connectivity — nearby pixels naturally share information; (3) translation invariance — same filter detects a feature anywhere in the image.

Q: What is transfer learning in the context of CNNs?
A: Take a CNN (e.g., ResNet50) pre-trained on ImageNet (1.2M images, 1000 classes). Remove final classification layer. Add your own classifier. Train only new layers (or fine-tune all) on your small dataset (even 1000 images works). Early layers already know edges/textures — they transfer.

🎥 CNNs explained (3Blue1Brown): https://www.youtube.com/watch?v=KuXjwB4LzSA
🎥 CNN in PyTorch (Aladdin Persson): https://www.youtube.com/watch?v=wnK3uWv_WkU
📚 CS231n CNN chapter: https://cs231n.github.io/convolutional-networks/
📚 Papers With Code - ImageNet SOTA: https://paperswithcode.com/sota/image-classification-on-imagenet`,

"rnn-lstm": `━━━ WHY WERE RNNs INVENTED? ━━━

BACKDROP — The Problem Before:
Dense networks and CNNs process inputs of FIXED size and treat them as independent.
But language, time series, and audio are SEQUENCES — the meaning of "bank" depends on the surrounding words ("river bank" vs "savings bank"). The ORDER matters.
Rumelhart et al. (1986) created Recurrent Neural Networks: process sequence step-by-step, maintaining a "hidden state" that summarises what has been seen so far. Memory through recurrence.

LSTM BACKDROP:
Plain RNNs suffered from vanishing gradients on long sequences — they could not remember information from 50 steps ago.
Hochreiter & Schmidhuber (1997) invented Long Short-Term Memory (LSTM) with gating mechanisms to selectively remember and forget — solving the long-term dependency problem.

━━━ HOW RNNs WORK ━━━

At each time step t, the RNN updates its hidden state:
  h_t = tanh(W_h × h_{t-1} + W_x × x_t + b)

The hidden state h_t carries information from all previous steps.

  import torch.nn as nn

  rnn = nn.RNN(input_size=10, hidden_size=128, num_layers=2, batch_first=True)
  lstm = nn.LSTM(input_size=10, hidden_size=128, num_layers=2, batch_first=True)

  x = torch.randn(32, 50, 10)    # (batch=32, seq_len=50, features=10)
  output, (h_n, c_n) = lstm(x)   # output: all hidden states; h_n: final; c_n: cell state

━━━ HOW LSTMs WORK ━━━

LSTM has THREE gates — all are sigmoid(0-1), controlling information flow:

  Forget gate:  f = sigmoid(W_f × [h, x]) — how much of old memory to keep
  Input gate:   i = sigmoid(W_i × [h, x]) — what new info to write to memory
  Output gate:  o = sigmoid(W_o × [h, x]) — what to output from memory

  Cell state c: the "memory tape" — updated: c_t = f * c_{t-1} + i * tanh(W_c × [h, x])
  Hidden state: h_t = o * tanh(c_t)

GRU (Gated Recurrent Unit, 2014):
  Simplified LSTM: merges forget + input gates into single "update gate."
  Fewer parameters, faster training, often equally good.
  nn.GRU(input_size=10, hidden_size=128)

━━━ REAL-WORLD EXAMPLES ━━━

• Google Voice Typing: LSTM converts your spoken audio to text (sequence → sequence). Used on Android for years before being replaced by Whisper-style transformers.
• Amazon Alexa: LSTM for intent detection from spoken sentences ("What is the weather tomorrow?").
• Stock Prediction: LSTMs on price/volume time series to predict next-day price movement (used at hedge funds like Two Sigma).
• Music Generation (Magenta by Google): LSTM generates MIDI sequences — trained on thousands of Bach chorales.
• Anomaly Detection: LSTM on server logs detects unusual access patterns that don't match normal sequences.

━━━ BENEFITS ━━━

• Handles variable-length sequences
• LSTM/GRU retain long-term dependencies (100+ steps)
• Bidirectional RNN sees full context (past + future)
• Works for sequence-to-sequence problems (translation, summarisation)

━━━ DISADVANTAGES ━━━

• Sequential — cannot parallelise across time steps (slow to train)
• Struggles with very long sequences (>1000 steps) even with LSTM
• Slower than Transformers on modern hardware (Transformers are fully parallel)

━━━ WHAT SOLVED THOSE DISADVANTAGES ━━━

• Transformers (2017): Self-attention processes all positions in parallel. No sequential bottleneck. Replaced LSTMs for NLP as of 2018.
• Mamba (2023): State Space Models — RNN-like but fully parallel. The next generation?
• But LSTMs are still widely used in: time series forecasting, embedded devices (low power), real-time streaming (inference is incremental, not batch)

━━━ INTERVIEW QUESTIONS ━━━

Q: What problem do LSTMs solve that plain RNNs cannot?
A: Vanishing gradient problem on long sequences. Plain RNN gradients shrink exponentially over many time steps — early inputs are "forgotten." LSTM gates allow gradients to flow unchanged through time (gradient highway), preserving long-term dependencies.

Q: What is the difference between LSTM and GRU?
A: LSTM has 3 gates (forget, input, output) and separate cell state + hidden state. GRU has 2 gates (update, reset) and only hidden state. GRU is faster and uses fewer parameters — often matches LSTM performance.

Q: What does bidirectional mean in a Bi-LSTM?
A: Two LSTMs — one processes sequence left-to-right, one right-to-left. Final hidden states are concatenated. The model sees both past and future context at each position. Used in BERT (bidirectional transformer).

Q: When would you still use LSTM over a Transformer in 2024?
A: Streaming/real-time use cases (process one token at a time, O(1) memory), small datasets (transformers need more data), embedded devices with memory constraints, time series with explicit temporal patterns.

🎥 LSTM explained (StatQuest): https://www.youtube.com/watch?v=YCzL96nL7j0
🎥 RNN/LSTM in PyTorch: https://www.youtube.com/watch?v=0_PgWWmauHk
📚 Colah's LSTM blog (ESSENTIAL): https://colah.github.io/posts/2015-08-Understanding-LSTMs/`,

"transformers": `━━━ WHY WERE TRANSFORMERS INVENTED? ━━━

BACKDROP — The Problem Before:
RNNs/LSTMs dominated NLP from 2014-2017.
But they had critical flaws:
• Sequential processing — step 1 must finish before step 2. Cannot parallelise → training on millions of sentences is slow.
• Long-range forgetting — even LSTM struggles with context 500+ tokens away.
• The encoder-decoder bottleneck: entire input compressed into one fixed-size vector.

Vaswani et al. at Google Brain published "Attention Is All You Need" (2017):
Replace recurrence entirely with SELF-ATTENTION — every token attends to every other token SIMULTANEOUSLY, in parallel. Transformers became the universal architecture for NLP, then vision, biology, and almost everything.

━━━ HOW TRANSFORMERS WORK ━━━

SELF-ATTENTION (the core mechanism):
  For each token, compute:
    Q (Query) = "What am I looking for?"
    K (Key)   = "What do I contain?"
    V (Value) = "What information will I pass?"

  Attention(Q, K, V) = softmax(QKᵀ / √d_k) × V

  Every token attends to every other token. Attention weights show HOW MUCH each token influences another.
  Example: in "The bank by the river", attention for "bank" weighs "river" highly → disambiguation.

MULTI-HEAD ATTENTION:
  Run attention H times with different weight matrices.
  Each "head" learns different relationships (syntactic, semantic, positional).
  Concatenate + project: allows model to jointly attend to different positions.

POSITIONAL ENCODING:
  Unlike RNNs, transformers process all positions simultaneously — they have no inherent sense of order.
  Add positional encoding (sin/cos functions of position) to embeddings.

FULL TRANSFORMER BLOCK:
  Input → Multi-Head Attention → Add+Norm → Feed Forward → Add+Norm → Output
  (Add+Norm = residual connection + layer normalisation)

━━━ BERT vs GPT ━━━

BERT (Bidirectional, Google, 2018):
  Encoder-only. Sees full context (both directions).
  Pre-training: Masked Language Model (predict masked tokens).
  Best for: text classification, NER, question answering.
  input → [MASK] prediction → pre-train on Wikipedia+BooksCorpus

GPT (Generative, OpenAI, 2018→2020→2023):
  Decoder-only. Autoregressive — predicts next token left-to-right.
  Pre-training: next-token prediction.
  Best for: text generation, chatbots, code completion.

  GPT-1: 117M params (2018)
  GPT-2: 1.5B params (2019)
  GPT-3: 175B params (2020) — few-shot learning emerged
  GPT-4: estimated 1.8T params (2023)

━━━ REAL-WORLD EXAMPLES ━━━

• ChatGPT / Claude / Gemini: All are transformer decoder models. ChatGPT processes your message as tokens → generates reply token-by-token using softmax over 50,000 vocabulary.
• Google Search (BERT, 2019): Google replaced keyword matching with BERT for understanding query intent. +10% better search relevance overnight.
• GitHub Copilot (Codex = GPT): Trained on 54M GitHub repos. Suggests code completions in real-time.
• DeepMind AlphaFold2: Transformer on amino acid sequences predicts protein 3D structure.
• Google Translate: Transformer replaced LSTM in 2017 — translation quality improved dramatically.

━━━ BENEFITS ━━━

• Fully parallel — processes entire sequence at once → 10-100× faster training vs LSTMs
• Long-range dependencies via attention — "The animal didn't cross the street because it was too tired" — "it" easily links to "animal" 7 words back
• Scales with compute — more GPU + more data = smarter model (scaling laws)
• Transfer learning: pre-train once on internet text → fine-tune on any task in minutes

━━━ DISADVANTAGES ━━━

• O(n²) memory with sequence length — 100K tokens = 10B attention pairs
• Needs massive data and compute to pre-train from scratch
• No inherent recurrence — not naturally suited to real-time streaming
• Hallucinations: models generate fluent but factually wrong text

━━━ WHAT SOLVED THOSE DISADVANTAGES ━━━

• Flash Attention (2022): Efficient attention kernel — same result, much less memory
• Longformer / BigBird: Sparse attention for long documents (O(n log n))
• Mamba (2023): State Space Model — linear complexity, no attention matrix
• RAG (Retrieval Augmented Generation): reduces hallucinations by grounding in facts

━━━ INTERVIEW QUESTIONS ━━━

Q: What is self-attention and how is it different from regular attention?
A: Regular attention: one sequence (decoder) attends to another (encoder). Self-attention: a sequence attends to ITSELF — each token attends to all other tokens in the same sequence. This lets the model learn which tokens are related to each other.

Q: What is the role of positional encoding in Transformers?
A: Transformers process all positions simultaneously (no sequential order). Positional encoding adds information about token position to the embeddings (using sin/cos functions). Without it, the model cannot distinguish "dog bites man" from "man bites dog."

Q: What is the difference between BERT and GPT architectures?
A: BERT: encoder-only, bidirectional (sees full context), best for classification/understanding tasks. GPT: decoder-only, autoregressive (sees only left context), best for text generation. Both use transformer blocks — they differ in masking and pre-training objective.

Q: What are the Q, K, V matrices in attention?
A: Each token produces three vectors (via learned linear projections): Q=Query (what I want to find), K=Key (what I contain), V=Value (what information I send). Dot product Q×Kᵀ gives similarity scores; softmax gives attention weights; V is the information summed up with those weights.

Q: What is a token and how does tokenisation work?
A: A token is a subword unit (not whole words). "unbelievable" → ["un", "believ", "able"]. BPE (Byte-Pair Encoding) merges frequent character pairs into subwords. GPT-4 vocabulary = ~50,000 tokens. This handles out-of-vocabulary words gracefully.

🎥 Attention Is All You Need illustrated (Jay Alammar): http://jalammar.github.io/illustrated-transformer/
🎥 Transformers (Andrej Karpathy builds GPT from scratch): https://www.youtube.com/watch?v=kCc8FmEb1nY
📚 Original paper: https://arxiv.org/abs/1706.03762
📚 Hugging Face Transformers docs: https://huggingface.co/docs/transformers`,

"generative-ai": `━━━ WHY WAS GENERATIVE AI INVENTED? ━━━

BACKDROP — The Problem Before:
All ML before 2014 was DISCRIMINATIVE — learns to classify or regress from labelled data.
It could answer "is this a cat?" but not "generate a new cat image."
Ian Goodfellow invented GANs in 2014 at a party (wrote the code the same night).
Insight: two neural networks in competition — a Generator creates fake data, a Discriminator tries to spot fakes. They train each other until fakes are indistinguishable from real.

━━━ GANs — HOW THEY WORK ━━━

GENERATOR (G): Takes random noise z → generates fake data (image, audio, video).
DISCRIMINATOR (D): Takes real or fake data → predicts probability of being real.

Minimax game:
  G wants to maximise: log(D(G(z)))    — fool D into thinking fakes are real
  D wants to maximise: log(D(x)) + log(1 - D(G(z)))  — correctly classify real/fake

Training alternates: train D for a step, then G for a step.

  import torch.nn as nn

  class Generator(nn.Module):
      def __init__(self, latent_dim=100, img_dim=784):
          super().__init__()
          self.net = nn.Sequential(
              nn.Linear(latent_dim, 256), nn.ReLU(),
              nn.Linear(256, 512), nn.ReLU(),
              nn.Linear(512, img_dim), nn.Tanh()  # output in [-1, 1]
          )
      def forward(self, z): return self.net(z)

FAMOUS GAN VARIANTS:
  DCGAN (2015):    CNN-based GAN → realistic face images
  StyleGAN (2019): NVIDIA → photorealistic faces (thispersondoesnotexist.com)
  CycleGAN (2017): Image-to-image translation (horse → zebra) without paired data
  Pix2Pix (2017):  Paired image translation (sketch → photo, B&W → colour)

━━━ DIFFUSION MODELS — HOW THEY WORK ━━━

Introduced by Ho et al. (2020). Replaced GANs as the dominant image generation paradigm.

FORWARD PROCESS: Gradually add Gaussian noise to an image over T steps (T=1000) until it's pure noise.
BACKWARD PROCESS: Train a neural network (U-Net) to predict and remove the noise at each step.
GENERATION: Start from pure noise → apply denoising network T times → high-quality image.

Why better than GANs?
  • Stable training — no mode collapse
  • Higher image quality + diversity
  • Easily conditioned on text (CLIP guidance)

━━━ STABLE DIFFUSION / DALL-E ━━━

  Text prompt → CLIP text encoder → conditioning signal →
  Latent Diffusion Model (denoising in latent space of a VAE) →
  Decode latent → final image

  from diffusers import StableDiffusionPipeline
  import torch
  pipe = StableDiffusionPipeline.from_pretrained(
      "runwayml/stable-diffusion-v1-5", torch_dtype=torch.float16
  ).to("cuda")
  image = pipe("a photorealistic cat astronaut on the moon").images[0]
  image.save("cat_astronaut.png")

━━━ VAES (Variational Autoencoders) ━━━

Encoder compresses input to a probability distribution (mean + variance) in latent space.
Decoder samples from that distribution → reconstructs or generates new data.
Used in: Stable Diffusion latent space, drug discovery, anomaly detection.

━━━ REAL-WORLD EXAMPLES ━━━

• Stable Diffusion / DALL-E 3 / Midjourney: Generate any image from text. Used by millions of designers, filmmakers, game developers.
• Adobe Firefly: Generative fill (remove/add objects to photos) — trained on Adobe Stock.
• GitHub Copilot / Cursor: GPT-4 generates code from comments. 1M+ paid developers.
• Sora (OpenAI, 2024): Diffusion model generates 1-minute high-definition videos from text prompts.
• Drug Discovery (Schrödinger, Insilico): GAN/Diffusion generates novel drug molecule structures with desired binding properties.
• NVIDIA StyleGAN: Powers virtual influencers, game character creation, VFX industry.

━━━ DISADVANTAGES ━━━

• GANs: training instability (mode collapse — generator only generates a few outputs), hard to train, need careful balancing
• Diffusion: slow inference (1000 denoising steps), high compute cost
• Deepfake risk: photorealistic fake images/videos raise misinformation concerns
• Copyright: models trained on copyrighted art without consent (ongoing legal battles)

━━━ WHAT SOLVED THOSE DISADVANTAGES ━━━

• DDIM / LCM (1-4 step diffusion): 100× faster inference
• Classifier-free guidance: better quality without external classifier
• Content policies + watermarking: attempts to detect AI-generated content
• RLHF: align generative models to human preferences (ChatGPT training method)

━━━ INTERVIEW QUESTIONS ━━━

Q: What is mode collapse in GANs?
A: The generator finds a few outputs that always fool the discriminator and stops exploring. Instead of diverse outputs, it generates the same image repeatedly. Fix: use Wasserstein loss (WGAN), mini-batch discrimination, or switch to diffusion.

Q: How does Stable Diffusion use both a VAE and a diffusion model?
A: The VAE compresses 512×512 images to 64×64 latent vectors (8× smaller). Diffusion happens in this latent space (much faster). The VAE decoder reconstructs the final image from the denoised latent. This is "Latent Diffusion Model."

Q: What makes diffusion models better than GANs for image generation?
A: Diffusion: stable training (no adversarial game), no mode collapse, better diversity, easily conditioned on text. GANs: faster inference (one forward pass vs 1000 steps), but training is unstable.

Q: What is CLIP and how does it enable text-to-image generation?
A: CLIP (Contrastive Language-Image Pre-training, OpenAI) jointly trains a text encoder and image encoder to align their representations. Given "a cat astronaut", CLIP's text embedding guides the diffusion model toward images with that meaning.

🎥 GANs explained (StatQuest): https://www.youtube.com/watch?v=TpMIssRdhco
🎥 Diffusion models explained: https://www.youtube.com/watch?v=fbLgFrlTnGU
📚 Diffusers library (Hugging Face): https://huggingface.co/docs/diffusers
📚 Original GAN paper: https://arxiv.org/abs/1406.2661`,

"reinforcement-learning": `━━━ WHY WAS REINFORCEMENT LEARNING INVENTED? ━━━

BACKDROP — The Problem Before:
Supervised learning needs labelled data: (input, correct output).
But for many tasks — playing chess, driving a car, controlling a robot — we cannot label every possible state.
We CAN define a reward signal: did we win or lose? Did we crash or not?
Richard Bellman (1957) developed Dynamic Programming. Christopher Watkins developed Q-Learning (1989).
Deep RL exploded in 2013 when DeepMind combined neural networks + Q-Learning to play Atari games from raw pixels.

━━━ CORE CONCEPTS ━━━

AGENT: The learner/decision-maker.
ENVIRONMENT: The world the agent interacts with.
STATE (s): Current situation of the environment.
ACTION (a): What the agent can do.
REWARD (r): Feedback signal after each action.
POLICY (π): Agent's strategy — maps states to actions.
VALUE FUNCTION V(s): Expected total future reward from state s.

━━━ Q-LEARNING ━━━

Q(s, a) = expected total reward from state s, taking action a, then following optimal policy.
Bellman equation:
  Q(s, a) = r + γ × max_a' Q(s', a')
  γ = discount factor (how much to value future rewards)

UPDATE RULE:
  Q(s, a) ← Q(s, a) + α × [r + γ × max_a' Q(s', a') - Q(s, a)]

DEEP Q-NETWORK (DQN):
  Replace Q-table with a neural network: input=state, output=Q-value for each action.
  Key tricks: Experience Replay Buffer + Target Network.

━━━ POLICY GRADIENT (more modern) ━━━

Instead of learning Q-values, directly learn a policy π(a|s) — probability of each action given state.
PPO (Proximal Policy Optimisation, 2017): Most widely used RL algorithm today.
  Stable, sample-efficient, used in: ChatGPT (RLHF), robotics, game AI.

━━━ REAL-WORLD EXAMPLES ━━━

• OpenAI ChatGPT: RLHF (RL from Human Feedback) fine-tunes GPT to be helpful/harmless. Human raters compare responses → train reward model → PPO optimises GPT against reward.
• DeepMind AlphaGo / AlphaZero: RL agent mastered Go by playing itself millions of times. Beat world champion Lee Sedol (2016). Then AlphaZero learned Chess + Shogi from scratch in 4 hours.
• OpenAI Five: Dota 2 AI (RL). Beat world champion team OG 2-0 in 2019.
• Robotics (Boston Dynamics): RL trains robot legs to walk, recover from pushes, climb stairs — without programming explicit gaits.
• Google Data Centre Cooling: DeepMind RL reduced Google's cooling energy by 40%. Agent controls pumps and fans in real-time.
• Waymo Self-Driving: Combines RL for policy with classical planning.
• Netflix: RL for thumbnail A/B testing — dynamically allocates traffic to better-performing thumbnails.

━━━ EXPLORATION vs EXPLOITATION ━━━

Core tradeoff in RL:
  Exploitation: do what you know works (take greedy action).
  Exploration: try new actions to discover better ones.
ε-greedy: with probability ε, take random action; otherwise take best known action.
Decrease ε over time: explore early, exploit later.

━━━ BENEFITS ━━━

• Learns from interaction — no labelled data needed
• Can solve problems where optimal solution is unknown
• Discovers superhuman strategies (AlphaGo found moves human experts never considered)

━━━ DISADVANTAGES ━━━

• Sample inefficient — needs millions of interactions to learn (expensive in real world)
• Reward hacking: agent finds unexpected ways to maximise reward that aren't the intended behaviour
• Instability: RL training can be very unstable and sensitive to hyperparameters
• Hard to specify good reward functions

━━━ INTERVIEW QUESTIONS ━━━

Q: What is the difference between model-free and model-based RL?
A: Model-free: agent learns directly from experience without a model of the environment (Q-Learning, PPO). Model-based: agent learns a model of the environment dynamics, uses it to plan ahead (AlphaZero, Dyna-Q). Model-based is more sample-efficient but harder to build accurate world models.

Q: What is the exploration-exploitation tradeoff?
A: Agent must balance: exploit known good actions (high reward now) vs explore unknowns (potentially better long-term). ε-greedy, UCB, and Thompson Sampling are strategies to balance this.

Q: What is RLHF (Reinforcement Learning from Human Feedback)?
A: Human raters rank model outputs → train a reward model on rankings → use PPO to optimise the language model's outputs to maximise predicted human preference. This is how ChatGPT was aligned to be helpful and safe.

Q: What is the Bellman equation?
A: V(s) = max_a [r(s,a) + γ × V(s')] — the value of a state equals the immediate reward plus the discounted value of the next state (under optimal policy). Fundamental recursive equation underlying dynamic programming and Q-learning.

🎥 RL course by David Silver (DeepMind, 10 lectures): https://www.youtube.com/playlist?list=PLqYmG7hTraZDM-OYHWgPebj2MfCFzFObQ
🎥 Policy Gradients (Andrej Karpathy): http://karpathy.github.io/2016/05/31/rl/
📚 Spinning Up in RL (OpenAI): https://spinningup.openai.com/
📚 Sutton & Barto textbook (FREE): http://incompleteideas.net/book/the-book.html`,

"time-series": `━━━ WHY IS TIME SERIES SPECIAL? ━━━

BACKDROP:
Standard ML assumes data points are IID (independent and identically distributed) — each row is independent.
Time series data violates this: today's stock price depends on yesterday's. Tomorrow's temperature depends on today's.
Time ORDER matters. You cannot shuffle rows. Future data must never appear in training.
Traditional statistics (ARIMA, 1970s) was purpose-built for this. Neural approaches emerged 2014+.

━━━ COMPONENTS OF TIME SERIES ━━━

A time series = Trend + Seasonality + Residual (noise)
  Trend:       long-term increase/decrease (growing sales, climate warming)
  Seasonality: recurring patterns (holiday spikes, winter heating)
  Residual:    random fluctuations

  from statsmodels.tsa.seasonal import seasonal_decompose
  result = seasonal_decompose(df["sales"], model="multiplicative", period=12)
  result.plot()

━━━ CLASSICAL METHODS ━━━

ARIMA (AutoRegressive Integrated Moving Average):
  AR(p): regression on p past values
  I(d):  differencing d times to make series stationary
  MA(q): regression on q past errors

  from statsmodels.tsa.arima.model import ARIMA
  model = ARIMA(series, order=(2, 1, 2))
  results = model.fit()
  forecast = results.forecast(steps=30)

PROPHET (Facebook/Meta, 2017):
  Handles trend breaks, holidays, missing data automatically.
  Excellent for business time series with clear seasonality.

  from prophet import Prophet
  model = Prophet(yearly_seasonality=True, weekly_seasonality=True)
  model.fit(df)   # df must have "ds" (date) and "y" (value) columns
  future = model.make_future_dataframe(periods=90)
  forecast = model.predict(future)

━━━ DEEP LEARNING APPROACHES ━━━

LSTM for time series:
  Create windows: use last 30 days to predict next 7.
  Input shape: (batch, sequence_length=30, features)

  N-BEATS (2019): Pure neural architecture, no recurrence — state of the art for univariate.
  Temporal Fusion Transformer (2020): Best for multi-variable time series with known future inputs.

━━━ GRADIENT BOOSTING FOR TIME SERIES ━━━

Transform time series into supervised learning: create lag features.
  df["lag_1"] = df["sales"].shift(1)    # yesterday's sales
  df["lag_7"] = df["sales"].shift(7)    # last week
  df["rolling_mean_30"] = df["sales"].rolling(30).mean()
  df["month"] = df["date"].dt.month
  # Then XGBoost / LightGBM on these features
  # This approach often beats LSTM for simple series!

━━━ REAL-WORLD EXAMPLES ━━━

• Amazon Demand Forecasting: Predicts inventory needs per product per warehouse 7 days ahead. Uses TFT (Temporal Fusion Transformer) at scale — preventing stockouts and overstock.
• Uber Surge Pricing: Predicts ride demand 30 min ahead from historical patterns + events + weather to set surge multipliers.
• ECG / Medical Monitoring: LSTMs detect anomalous heartbeat patterns in real-time ICU monitoring.
• Google Search Trends: ARIMA-based forecasting for ad budget allocation.
• Energy Trading: Predict electricity prices for next 24 hours — LSTM or XGBoost with lag features. Worth millions per day.

━━━ CRITICAL RULE — NO DATA LEAKAGE ━━━

NEVER use future data in training. Always split chronologically:
  # WRONG: random split leaks future into training
  X_train, X_test = train_test_split(df, test_size=0.2, shuffle=True)

  # CORRECT: chronological split
  split_idx = int(len(df) * 0.8)
  train = df.iloc[:split_idx]
  test  = df.iloc[split_idx:]

Use TimeSeriesSplit for cross-validation (sklearn).

━━━ INTERVIEW QUESTIONS ━━━

Q: What is stationarity and why does ARIMA require it?
A: A stationary series has constant mean, variance, and autocorrelation over time — statistical properties don't drift. ARIMA's AR and MA components assume stationarity. Test with Augmented Dickey-Fuller test. Fix with differencing (subtract previous value) or log transform.

Q: Why can't you use standard k-fold cross-validation for time series?
A: Standard k-fold shuffles data — some training samples would come AFTER test samples in time, creating data leakage. Use TimeSeriesSplit (sklearn) which always trains on past, tests on future.

Q: What is the difference between one-step-ahead and multi-step forecasting?
A: One-step: predict t+1 from t. Multi-step: predict t+1, t+2, ..., t+h. Approaches: recursive (feed predictions back as inputs), direct (train a separate model per horizon), or seq2seq (LSTM/Transformer encoder-decoder).

Q: When would you use Prophet over LSTM?
A: Prophet: business metrics with clear yearly/weekly seasonality, holiday effects, trend breakpoints — and fast iteration is needed. LSTM: complex multivariate patterns, sufficient data (>2 years), and you have GPU training infrastructure.

🎥 Time Series (StatQuest): https://www.youtube.com/watch?v=GE3JOFwTWVM
🎥 Prophet tutorial (Facebook): https://facebook.github.io/prophet/docs/quick_start.html
📚 Forecasting Principles (Hyndman, FREE): https://otexts.com/fpp3/
📚 Nixtla (state-of-art forecasting library): https://nixtlaverse.nixtla.io/`,

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
