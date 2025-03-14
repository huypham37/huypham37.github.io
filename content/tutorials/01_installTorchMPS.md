---
title: "Installing PyTorch with MPS Support on macOS (Apple Silicon)"
date: "2025-03-14T10:00:00Z"
draft: false
tags: ["pytorch", "mps", "apple-silicon", "machine-learning"]
---

This tutorial guides you through installing PyTorch with Metal Performance Shaders (MPS) support on a Mac with Apple silicon (M1, M2, M3). MPS enables GPU acceleration natively on macOS, making it ideal for machine learning tasks. We'll build PyTorch from source to ensure MPS compatibility, addressing common issues like missing OpenMP libraries (`libomp`) by installing LLVM via Homebrew.

## Prerequisites
- **Hardware**: Mac with Apple silicon (M1, M2, M3, etc.).
- **OS**: macOS 12.3 or later (check with `sw_vers`).
- **Tools**:
  - Xcode Command Line Tools (CLT).
  - Homebrew (package manager).
  - Python 3.8+ (preferably 3.10 or 3.11).
  - Git.

## Step 1: Install Required Tools
### 1.1 Install Xcode Command Line Tools
Xcode CLT provides compilers and libraries needed for PyTorch.
```bash
xcode-select --install
```
- Verify installation: `xcode-select -p` should output `/Library/Developer/CommandLineTools`.

### 1.2 Install Homebrew
Homebrew manages dependencies like LLVM.
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
- Verify: `brew --version`.

### 1.3 Install Python
Use a version compatible with PyTorch.
```bash
brew install python@3.11
```
- Alternatively, use Miniconda: `brew install miniconda` and follow its setup.

### 1.4 Install Git
```bash
brew install git
```

## Step 2: Set Up a Virtual Environment
Isolate your Python environment.
```bash
python3 -m venv venv
source venv/bin/activate
```
- Verify: `which python` should point to `venv/bin/python`.

## Step 3: Install Dependencies
Install build tools and libraries.
```bash
pip install --upgrade pip
pip install cmake ninja numpy pyyaml setuptools typing_extensions
brew install libpng libjpeg-turbo
```

## Step 4: Install LLVM for OpenMP Support
PyTorch requires `libomp` for parallelism. Since Xcode CLT may lack it, install LLVM.
```bash
brew install llvm
```
- Verify: `ls /opt/homebrew/opt/llvm/lib/libomp*` should show `libomp.dylib`.

## Step 5: Configure Your Shell Environment
Edit your `~/.zshrc` (or equivalent) to use LLVM’s compilers and libraries.
```bash
nano ~/.zshrc
```
Add or update with:
```bash
# Conda initialization (if using Miniconda)
# >>> conda initialize >>>
__conda_setup="$('/Users/mac/miniconda3/bin/conda' 'shell.zsh' 'hook' 2> /dev/null)"
if [ $? -eq 0 ]; then
    eval "$__conda_setup"
else
    if [ -f "/Users/mac/miniconda3/etc/profile.d/conda.sh" ]; then
        . "/Users/mac/miniconda3/etc/profile.d/conda.sh"
    else
        export PATH="/Users/mac/miniconda3/bin:$PATH"
    fi
fi
unset __conda_setup
# <<< conda initialize <<<

# Optional: Autojump (if installed)
[ -f $(brew --prefix)/etc/profile.d/autojump.sh ] && . $(brew --prefix)/etc/profile.d/autojump.sh

# Starship prompt (if using)
eval "$(starship init zsh)"

# Compiler settings for LLVM
export CC=/opt/homebrew/opt/llvm/bin/clang
export CXX=/opt/homebrew/opt/llvm/bin/clang++

# Add LLVM and Homebrew bin to PATH
export PATH="/opt/homebrew/opt/llvm/bin:/opt/homebrew/bin:$PATH"

# Linker and preprocessor flags for LLVM
export LDFLAGS="-L/opt/homebrew/opt/llvm/lib"
export CPPFLAGS="-I/opt/homebrew/opt/llvm/include"
```
- Save and reload: `source ~/.zshrc`.
- Verify: `clang --version` should show LLVM’s version.

## Step 6: Clone and Build PyTorch
### 6.1 Clone the Repository
```bash
git clone --recursive https://github.com/pytorch/pytorch
cd pytorch
```
- `--recursive` ensures submodules are included.

### 6.2 Build PyTorch
```bash
source venv/bin/activate
export USE_MPS=1  # Enable MPS support
rm -rf build/     # Clean any stale build
python setup.py develop
```
- This builds and installs PyTorch in editable mode. Expect 20-60 minutes depending on your Mac.

## Step 7: Verify the Installation
### 7.1 Check Version and MPS Support
```python
import torch
print(torch.__version__)          # e.g., 2.8.0a0+gitbe4e6c1
print(torch.backends.mps.is_available())  # True
print(torch.backends.mps.is_built())      # True
```
- `is_available()` requires macOS 12.3+ and ARM64. `is_built()` confirms MPS was compiled.

### 7.2 Test Tensor Operations on MPS
```python
x = torch.randn(3, 3).to("mps")
print(x)
y = x + 2
print(y)
```
- Expected: Tensors on `mps:0` with correct computation.

### 7.3 Test with a Model (Optional)
For use with **optimum-quanto**:
```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from optimum.quanto import quantize, qint8

model_id = "facebook/opt-125m"
model = AutoModelForCausalLM.from_pretrained(model_id).to("mps")
tokenizer = AutoTokenizer.from_pretrained(model_id)

quantize(model, weights=qint8)
inputs = tokenizer("Hello from MPS!", return_tensors="pt").to("mps")
outputs = model.generate(**inputs)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```
- Expected: Generates text (e.g., continuation of the input).

### 7.4 Check OpenMP Support
```python
x = torch.randn(10000, 10000)
y = x @ x
print(y.shape)  # (10000, 10000)
```
- Should run without OpenMP errors, using multiple CPU cores.

## Troubleshooting
- **PyTorch Not Found**: Ensure `venv` is active and rebuild if needed.
- **MPS Not Available**: Verify macOS (12.3+) and ARM64 (`uname -m`). Set `export PYTORCH_ENABLE_MPS_FALLBACK=1` for CPU fallback.
- **Linking Errors (e.g., 'omp' not found)**: Ensure LLVM is installed and `LDFLAGS`/`CPPFLAGS` are set. Reinstall Xcode CLT if needed: `xcode-select --install`.
- **Build Fails**: Clean with `rm -rf build/` and retry. Check logs for specific errors.

## Additional Notes
- **Why Build from Source?**: Ensures the latest MPS fixes and customization (e.g., `main` branch). Nightly wheels (`pip install --pre torch -f https://download.pytorch.org/whl/nightly/cpu`) are an alternative but less flexible.
- **Disk Space**: Building requires ~10-20GB free.
- **Performance**: MPS accelerates inference; quantization with **optimum-quanto** further optimizes memory usage.

## Acknowledgments
This tutorial was crafted with assistance from Grok 3 (xAI), based on real-time troubleshooting on March 14, 2025.

Happy coding with PyTorch on your Mac!
```

### Notes on the Tutorial
- **Structure**: Follows a logical flow from setup to verification, with troubleshooting for common issues.
- **Customization**: Reflects your journey (e.g., LLVM for `libomp`, `.zshrc` tweaks).
- **MPS Focus**: Emphasizes Apple silicon compatibility.
- **optimum-quanto**: Included a test case since it’s your use case.

