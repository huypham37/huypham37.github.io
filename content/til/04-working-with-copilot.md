---
title: "What I've Learned from Pair Programming with Copilot"
date: "2025-02-23T13:00:00Z"
draft: false
tags: ["copilot", "pair-programming", "tips"]
---


- Always generate a comprehensive test suite and integration test suite after writing the code (for each module and for modules working together).

- Copilot is not a magical tool; it can't create wonders on its own. It's best to ask it to assist with repetitive tasks or generate boilerplate code.

- Don't fall into the trap of relying solely on Copilot. Read the error messages from the terminal or test output. I used to spend two hours repeatedly passing terminal failed error messages to Copilot, asking it to fix them, but it couldn't. The loop would continue until I read the error message and fixed it myself.

- However, Copilot can be helpful in a way. It can prevent you from writing overly complex code by suggesting that "Just do it." By removing the initial barrier of syntax and structure, you can start writing code without overthinking it. 