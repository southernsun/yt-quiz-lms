function validateQuestions(obj){
    var q = obj.questions;

    const correct = (element) => element.correct == true;

    // at least each question has a single valid answers.
    q.forEach(function (item, index) {
        if (!item.answers.some(correct)) console.log('question with id [' + item.id + '] doesnt have a valid answer.');

        var correctAnswers = 0;

        for (var i = 0; i < item.answers.length; i++){
            if (item.answers[i].correct) correctAnswers++;
        }

        if (correctAnswers != 1)
        {
            console.log('question with id [' + item.id + '] has an invalid of number of correct answers.');
        }
    });
}

function loadQuestions(){
    var questions = `
    {
      "questions": [
        { 
          "id": "q01", 
          "timeInSeconds": 5,
          "question": "This song was used in which tv-serie?",
          "answers": [
            { 
              "answer": "Friends",
              "correct": false
            },
            { 
              "answer": "Mr. Robot",
              "correct": true
            }
          ]
        },
        { 
          "id": "q02", 
          "timeInSeconds": 10,
          "question": "OK Go consists of how many band members...?",
          "answers": [
            { 
              "answer": "3",
              "correct": false
            },
            { 
              "answer": "4",
              "correct": true
            }
          ]
        },
        { 
          "id": "q03", 
          "timeInSeconds": 170,
          "question": "You are almost at the end of the song...?",
          "answers": [
            { 
              "answer": "False",
              "correct": false
            },
            { 
              "answer": "True",
              "correct": true
            }
          ]
        }
      ]
    }`;

    return questions;
}
