/* variables */

var intervalUpdateTimer = null;
var intervalUpdateProgressBar = null;
var intervalUserViewed = null;
var intervalShowQuestion = null;
var lastShownQuestionId = null;

var noEmailAddress = "not set";

/* userinfo object to track progress from the user */
var userinfo = {
    viewed: null,
    email: null,
    questions: null,
};

function Initialize(){
    var duration = player.getDuration();

    if (duration >= 65536){
        console.log('ERROR: unable to initialize. The video is too long.');
        return;
    }

    // setup userinfo object;
    userinfo.email = getUrlParam('email', noEmailAddress);
    userinfo.viewed = Array.from('x'.repeat(duration));    
    userinfo.questions = [];

    questions_array.questions.forEach(function (item, index) {
        var result = {};
        
        result.id = item.id;
        result.question = item.question;
        result.answered = false;
        result.correct = false;

        userinfo.questions.push(result);
    });

    // show warning when no userinfo.email is specified;
    if (userinfo.email == noEmailAddress){
        userinfo.email = 'example@example.com';
        // alert('No e-mail address specified. Results will not be registered!');
    }
}

function playing(){
    if (DEBUG) console.log('playing ...');

    UpdateUserViewed();
    UpdateTimer();
    UpdateProgressBar();

    AutoRefreshUserViewed();
    AutoRefreshTimer();
    AutoRefreshProgressBar();

    TimerToCheckIfQuestionNeedsToPopup();
}

function paused(){
    if (DEBUG) console.log('paused ...');

    clearInterval(intervalUserViewed);
    intervalUserViewed = null;

    clearInterval(intervalUpdateTimer);
    intervalUpdateTimer = null;

    clearInterval(intervalUpdateProgressBar);
    intervalUpdateProgressBar = null;

    clearInterval(intervalShowQuestion);
    intervalShowQuestion = null;
}

function ended(){
    if (DEBUG) console.log('ended ...');

    var total = questions_array.questions.length;
    var correct = 0;

    userinfo.questions.forEach(function(item, index){
        if (item.correct) {
            correct++;
        }
    });

    var secondsViewed = userinfo.viewed.filter(x => x === 'o').length;
    var totalLength = userinfo.viewed.length;
    var percentageScore = Math.round(correct / total * 100 * 100) / 100;

    var percentageWatched = Math.round(secondsViewed / totalLength * 100);

    ShowScore(correct, total, percentageScore, percentageWatched);
    SendResult(correct, total, percentageScore, percentageWatched);
}

function SendResult(correct, total, percentageScore, percentageWatched){
    var result = { 
        email: userinfo.email,
        total: total,
        correct: correct,
        percentage: percentageScore,
        viewed: percentageWatched, 
    };

    // The call below can be enabled to POST your results to your personal API;
    // Update the 'url' property with your endpoint address.

    // $(function () {
    //     $.ajax({
    //         type: "POST",
    //         url: "<your url>",
    //         data: JSON.stringify(result),  
    //         contentType: 'application/json; charset=utf-8', 
    //         dataType: "json",
    //         success: function (response) {
    //             // console.log(response);
    //         },
    //         failure: function (response) {
    //             // console.log(response);
    //         },
    //         error: function (response) {
    //             // console.log(response);
    //         }
    //     });
    // });
}

function ShowScore(correct, total, percentageScore, percentageWatched){

    $("div.modal-body h1").text(correct + ' out of ' + total);
    $("div.modal-body h2").text('a ' + percentageScore + '% score');
    $("div.modal-body i").text('You\'ve watched ' + percentageWatched + '% of the video.');
    $("div.modal-body span").text(userinfo.email);

    $("#scoreModal").modal();
}

function UpdateTimer(){
    var currentTimeInSeconds = player.getCurrentTime();
    var duration = player.getDuration();

    document.getElementById('timing').innerHTML = secondsToTime(currentTimeInSeconds) + " / " + secondsToTime(duration) + "  -  " + userinfo.email;
}

function UpdateUserViewed(){
    var currentTimeInSeconds = player.getCurrentTime();
    userinfo.viewed[parseInt(currentTimeInSeconds)] = 'o';
}

function UpdateProgressBar(currentTimeInSeconds){
    if (typeof currentTimeInSeconds === 'undefined') { currentTimeInSeconds = player.getCurrentTime(); }

    var durationInSeconds = player.getDuration();

    var progressbar = document.getElementById("progressbar");

    var percentage = Math.round((currentTimeInSeconds / durationInSeconds) * 10000) / 100; // rounded to two decimals.

    progressbar.style.width = percentage + '%';
}

function AutoRefreshUserViewed(){
    if (!intervalUserViewed) intervalUserViewed = setInterval(UpdateUserViewed, 650);
}

function AutoRefreshTimer(){
    if (!intervalUpdateTimer) intervalUpdateTimer = setInterval(UpdateTimer, 650);
}

function AutoRefreshProgressBar(){
    if (!intervalUpdateProgressBar) intervalUpdateProgressBar = setInterval(UpdateProgressBar, 650);
}

function TimerToCheckIfQuestionNeedsToPopup(){
    if (!intervalShowQuestion) intervalShowQuestion = setInterval(CheckIfQuestionNeedsToPopup, 650);
}

function CheckIfQuestionNeedsToPopup(){
    var currentTimeInSeconds = Math.round(parseInt(player.getCurrentTime()));

    var found = false;

    questions_array.questions.forEach(function(question, index){
        if (currentTimeInSeconds === question.timeInSeconds){
            found = true;

            if (lastShownQuestionId === question.id){
                return;
            }

            showQuestionModal(question);
        }
    });

    if (!found){
        lastShownQuestionId = null;
    }
}

function HandleProgressBarClick(){
    document.getElementById('progress').addEventListener("click", function(event){
        var percentage = (event.clientX-this.offsetLeft) / this.offsetWidth * 100;

        var durationInSeconds = player.getDuration();
        var locationInSeconds = Math.round(durationInSeconds * (percentage / 100));

        player.seekTo(locationInSeconds, true);
        player.playVideo();
      });
}

function HandleQuestionClick(question_id){
    var question = questions_array.questions.find(obj => obj.id == question_id);
    UpdateProgressBar(parseInt(question.timeInSeconds));

    player.seekTo(question.timeInSeconds, true);

    showQuestionModal(question);
}

function IsAnswered(question_id){
    var found = false;
    userinfo.questions.forEach(function(item, index){
        if (item.id === question_id){
            found = item.answered;
        }
    });

    return found;
}

function showQuestionModal(question){
    if (IsAnswered(question.id)){
        return;
    }

    player.pauseVideo();

    // reset modal;
    $(":input[name='submitAnswer']").text('Answer');
    $(":input[name='submitAnswer']").attr("disabled", "disabled");
    $("div.modal-body:first :radio").attr('disabled', false);

    // set title with question
    $("#questionModalLabel").html(question.question);
    $("div.modal-body:first").empty();

    var layout = `
<div class="custom-control custom-radio">
    <input type="radio" class="custom-control-input" id="$ID$_rb" name="groupOfDefaultRadios" data="$GOED$">
    <label class="custom-control-label" for="$ID$_rb">$QUESTION$</label>
</div>        
    `;

    var answers = shuffle(question.answers);

    // populate possible answers
    for (var i = 0; i < answers.length; i++){
        n_layout = layout.replace('$QUESTION$', answers[i].answer);
        n_layout = n_layout.replace(/\$ID\$/g, question.id + '_' + i.toString());
        n_layout = n_layout.replace('$GOED$', answers[i].correct)

        $("div.modal-body:first").append(n_layout);
        $("div.modal-body:first").attr('data', question.id);
    }

    // if items is selected; enable button to answer question;
    $("div.modal-body:first :radio").change(function(){
        $(":input").removeAttr("disabled");
    });

    lastShownQuestionId = question.id;

    $("#questionModal").modal();
}

function VerifyAnswer(){
    if (DEBUG) console.log('verifing answer...');

    // if submitAnswer button is named "Close", then just close the modal and continue playing.
    if ($(":input[name='submitAnswer']").text() == 'Close'){
        $("#questionModal").modal('hide');
        player.playVideo();
        return;
    }

    // disable radio buttons
    $("div.modal-body:first :radio").attr('disabled', true);

    // highlight possible answers with correct color
    $("div.modal-body:first :radio").each(function(){
        if ($(this).attr('data') === "true"){
            $(this).parent().children('label').addClass("greenText");
        }
        else {
            $(this).parent().children('label').addClass("redText");
        }
    });

    var selectedOption = $("div.modal-body:first :radio:checked");
    var providedAnswer = selectedOption.parent().children('label').text();

    var question_id = $("div.modal-body:first").attr('data');

    if (selectedOption.attr('data') === "true"){
        // correct answer provided
        UpdateUserInfo(question_id, true, providedAnswer);

        // change color of question marker on progress bar
        $(".progress").find("[data='" + question_id + "']").removeClass("no-color");
        $(".progress").find("[data='" + question_id + "']").addClass("success-color");

        // close modal and continue playing
        $("#questionModal").modal('hide');
        player.playVideo();
    } else {
        // wrong answer provided
        UpdateUserInfo(question_id, false, providedAnswer);

        // change color of question marker on progress bar
        $(".progress").find("[data='" + question_id + "']").removeClass("no-color");
        $(".progress").find("[data='" + question_id + "']").addClass("danger-color");

        // Update text on button
        $(":input[name='submitAnswer']").text('Close');
    }
}

function UpdateUserInfo(question_id, correct, providedAnswer){
    userinfo.questions.forEach(function(item, index){
        if (item.id === question_id){
            item.answered = true;
            item.correct = correct;
            item.answer = providedAnswer;
        }
    });
}

// Adds visible markers on the progress bar to represent the questions
function DisplayQuestionsOnProgressBar(questions_array){
    for (var i = 0; i < questions_array.questions.length; i++){

        var question = questions_array.questions[i];

        var durationInSeconds = player.getDuration();
        var timeInSeconds = question.timeInSeconds;
        var percentage = Math.round((timeInSeconds/durationInSeconds) * 100);

        $(".progress").prepend("<div class='one no-color' style='left: " + percentage + "%' onclick='HandleQuestionClick(\"" + question.id + "\"); event.stopPropagation();' data='" + question.id + "'></div>");
    }
}

/* convert seconds to hours, minutes, seconds */
function secondsToTime(seconds){
    var _hours = Math.floor(seconds / 3600);
    var _minutes = Math.floor(seconds / 60);
    var _seconds = Math.floor(seconds % 60);
    if (_hours > 0){
        var _minutes = Math.floor(seconds % 3600 / 60);
        return _hours + ":" + appendZero(_minutes) + ":" + appendZero(_seconds);
    } else {
        return _minutes + ":" + appendZero(_seconds);
    }
}

function appendZero(value){
    if (value < 10){
        return "0" + value;
    }

    return value;
}

/* used to shuffle questions.
 * from: Fisher–Yates shuffle: https://bost.ocks.org/mike/shuffle/ 
 */
function shuffle(array) {
    var m = array.length, t, i;
  
    // While there remain elements to shuffle…
    while (m) {
  
      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);
  
      // And swap it with the current element.
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
  
    return array;
}

/* read parameters
 * from: https://html-online.com/articles/get-url-parameters-javascript/ 
 */
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });

    return vars;
}

function getUrlParam(parameter, defaultvalue){
    var urlparameter = defaultvalue;
    if(window.location.href.indexOf(parameter) > -1){
        urlparameter = getUrlVars()[parameter];
    }

    return decodeURI(urlparameter);
}