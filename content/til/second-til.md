---
title: "std::cout is Not Thread-Safe: Using stringstream for Safe Multithreaded Output in C++"
date: "2025-02-23T12:00:00Z"
draft: false
---

Today I learned that `std::cout` is not thread-safe by default. When multiple threads try to write to `std::cout` simultaneously, the output can become jumbled and garbled due to race conditions.

## The Problem

Consider this problematic code:

```cpp
#pragma omp parallel
{
    int thread_id = omp_get_num_threads();
    std::cout << "Hello from thread " << thread_id << "\n";
}
```

This can produce jumbled output like:
```
Hello Hello from thread from thread 12
Hello from thread 3
```

## The Solution: Using stringstream

A better approach is to use `std::stringstream` to build the complete string in thread-local storage before writing to `std::cout`:

```cpp
#pragma omp parallel
{
    int thread_id = omp_get_num_threads();
    std::stringstream ss;
    ss << "Hello from thread " << thread_id << "\n";
    
    // Convert to string first
    std::string output = ss.str();
    
    // Write the complete string at once
    std::cout << output;
}
```

## Why This Works

1. `std::stringstream` creates a thread-local buffer for building the output string
2. The string construction happens entirely within each thread
3. The final write to `std::cout` is more likely to be atomic when writing a single string
4. Each thread maintains its own independent stringstream, preventing race conditions

## Alternative: Using Critical Sections

If you really need to use `std::cout` directly, you can also use OpenMP's critical section:

```cpp
#pragma omp parallel
{
    int thread_id = omp_get_num_threads();
    #pragma omp critical
    {
        std::cout << "Hello from thread " << thread_id << "\n";
    }
}
```

However, using `stringstream` is often more efficient as it minimizes the time spent in critical sections.

## Key Takeaway

When dealing with multithreaded output in C++, always remember that `std::cout` operations are not thread-safe. Use `std::stringstream` to build output strings locally before writing them, or properly synchronize access to `std::cout` using critical sections or mutexes.