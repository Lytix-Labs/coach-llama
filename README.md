<h1 align="center">
    <Image src="public/llama_base.png" alt="Coach Llama" width="100">
</h1>
<h2 align="center">
    Coach LlaMa 🧢🦙
</h2>
<p align="">
    Coach LLaMa is your own personal gym trainer, powered by computer vision 🤖👀 and AI 🧠. Get instant feedback on if you're performing your lifts correctly and safely. Select the exercise you're performing, and record yoursel doing one rep. Coach LLaMa will analyze the footage, and let you know where you're going wrong! 
</p>
<p align="center">
    <a href="https://lytix.co">
        <img src="https://img.shields.io/badge/Visit%20Us-Lytix-brightgreen" alt="Lytix">
    </a>  
    <a href="https://discord.gg/8TCbHsSe">
        <img src="https://img.shields.io/badge/Join%20our%20community-Discord-blue" alt="Discord Server">
    </a>
</p>

<p align="center">
        <img src="./public//demo.gif" alt="Landing Page Demo">
</p>

## Live demo

[**Check it out here 🚀**](https://coach-llama.lytix.co/)

## How to start Coach LLaMa on your local machine

#### Prerequisites

- [Lytix](https://lytix.co) account. Instruction on how to get an API key can be found [here](https://docs.lytix.co/api-key-setup)

```

Install  dependencies

```

npm install

```

### Start Co

Start the React app

```

npm start

```

### To add support for new exercises:
1. Navigate to app.js, add your chosen lift to the prompt in "handAskGPT", along with prompt instructions on how to analyze coordiantes.
2. Also add your lift to the select box that sets the selectedExercise state.
```
