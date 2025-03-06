---
title: "Setting Up OpenMP on macOS"
date: "2025-02-22T12:00:00Z"
draft: false
tags: ["openmp", "macos", "clang", "llvm", "cmake"]
---

## Problem Description

When trying to compile OpenMP code on macOS, you might encounter this error:

```bash
fatal error: 'omp.h' file not found
#include <omp.h>
         ^~~~~~~
1 error generated.
```

This occurs because Apple's default Clang compiler doesn't include OpenMP support out of the box.

## Solution

### 1. Install LLVM using Homebrew

```bash
brew install llvm
```

### 2. Set up Environment Variables

Add these lines to your `~/.zshrc` (or `~/.bash_profile`):

```bash
# LLVM/OpenMP configuration
export PATH="/opt/homebrew/opt/llvm/bin:$PATH"
export CC=/opt/homebrew/opt/llvm/bin/clang
export CXX=/opt/homebrew/opt/llvm/bin/clang++
export LDFLAGS="-L/opt/homebrew/opt/llvm/lib"
export CPPFLAGS="-I/opt/homebrew/opt/llvm/include"
```

Then reload your shell configuration:
```bash
source ~/.zshrc
```

### 3. Update CMakeLists.txt

Force CMake to use LLVM's Clang before the project declaration:

```cmake
cmake_minimum_required(VERSION 3.14)

# Force CMake to use LLVM compiler before project() declaration
set(CMAKE_C_COMPILER "/opt/homebrew/opt/llvm/bin/clang")
set(CMAKE_CXX_COMPILER "/opt/homebrew/opt/llvm/bin/clang++")

project(
    openmp
    VERSION 0.1.0
    DESCRIPTION "Your project description"
    LANGUAGES CXX
)

# Add OpenMP support
find_package(OpenMP REQUIRED)

# Add OpenMP to your targets
target_link_libraries(your_target PRIVATE OpenMP::OpenMP_CXX)
```

### 4. Build the Project

```bash
mkdir build
cd build
cmake ..
cmake --build .
```

## Understanding the Fix

1. **Why this works**:
   - LLVM's version of Clang includes OpenMP support
   - Setting compiler paths before `project()` ensures CMake uses the correct compiler
   - Environment variables ensure system-wide availability of LLVM tools

2. **Key Commands**:
   - `cmake ..` - Generates build system using parent directory's CMakeLists.txt
   - `cmake --build .` - Compiles the code using generated build system

3. **Environment Variables Purpose**:
   - `PATH`: Makes LLVM binaries available system-wide
   - `CC/CXX`: Sets default C/C++ compilers
   - `LDFLAGS/CPPFLAGS`: Provides linker and preprocessor with LLVM library locations

## Verification

To verify the setup:

```bash
which clang++  # Should show /opt/homebrew/opt/llvm/bin/clang++
clang++ --version  # Should show LLVM version
```

Your OpenMP programs should now compile and run successfully on macOS.