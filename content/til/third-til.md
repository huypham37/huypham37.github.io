---
title: "Computing π with OpenMP"
date: "2025-02-23T12:00:00Z"
draft: false
tags: ["openmp", "parallel-computing", "cpp"]
---

## Overview

- **Numerical Integration for π:**  
  The function computes π by integrating the function `4/(1+x^2)` over [0,1] using a Riemann sum with midpoints.

- **Timing with std::chrono:**  
  The duration for the computation is measured using C++11's `<chrono>` utilities.

## Using OpenMP

- **Parallel Region:**  
  The computation is performed inside an OpenMP parallel region where each thread calculates a partial sum.

- **Local Sum per Thread:**  
  Each thread uses its own `local_sum` variable to accumulate values from its portion of the loop. This prevents race conditions.

- **Combining Results:**  
  There are two common ways to combine the thread-local results:
  1. **Critical Section:**  
     - Wrap the update of `sum` in a `#pragma omp critical` block.
     - This ensures only one thread updates `sum` at a time.
     - **Downside:** Overhead due to thread contention.
  2. **Reduction Clause:**  
     - Use `#pragma omp for reduction(+:sum)` which provides each thread with a private copy of `sum`.
     - OpenMP automatically handles the combination after the loop.
     - **Advantage:** More efficient with less overhead compared to a critical section.

## What We Observed

- **Performance:**  
  Removing the critical section can show faster performance since threads don't have to wait. However, without any mechanism (like reduction) to combine the results, the final value of `sum` would be computed incorrectly.
  
- **Correctness vs. Overhead:**  
  The critical directive ensures correctness by serializing the merging of results, but at the cost of performance. The reduction clause offers both correctness and better performance.

## Key Takeaways

- The critical directive allows only one thread to execute a block at a time, ensuring safe updates to shared variables but can slow down the program.
  
- The reduction clause creates private copies of a variable for each thread, automatically merging them after execution, which minimizes synchronization overhead.

This summary encapsulates the key insights related to parallel computation and synchronization using OpenMP as discussed in the context of the `compute_pi.cpp` file.