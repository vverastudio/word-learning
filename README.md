An app for learning English words from literature in the style of Quizlet or Anki.

Design goals:
- Vite + React + TypeScript app
- Playful minimalistic design

## TODO:
- Scaffold Vite + React + TypeScript app
- Load the words from a JSON file, with info about the English word, the Polish translation, as well as the Category they belong to (the heading)
- Allow the user to start a "lesson", pick from the available categories (can pick more than one), and the system should pick 4 words that are considered least "known" (meaning their scope is the lowest, where the score is 0 if the word has been correctly identified <5 times, or is a value between 0-1 that indicates the percentage of correct guesses in the span of the last up-to 20 guesses). During the lesson, the user is then shown a card with the Polish explanation on it, and is shown 4 English words as a solution. 3 of them are random, and the 4th is the correct solution, they must identify which one correctly describes the Polish description, and choose it. If they pick the wrong answer, the correct one is highlighted green so they can do it correctly next time. The system remembers if the user guessed it wrong or right, and saves it to local storage. The lesson lasts until all words were correctly identified at least once.
- Show statistics on the main menu - percentage of words seen at least once, percentage of words considered "known" (meaning they have a score of at least 0.8)
- Create a "revision" mode, where the polish description shows up, and the user has to type in exactly the english word that corresponds to it. They are graded based on how closely the word they typed matches the solution. They should also be able to select the categories they want to revise, but all words from those categories have to appear, and only once. How well the user does on each word is not stored anywhere, it's only used to calculate the grade at the end of the revision.
- Add sound-effects to clicking on cards, getting things right, and getting things wrong. All sound effects are in public/sfx
- Integrate a tool that generates text-to-voice in the browser, and use it to spell the English words when clicked.
