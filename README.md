# YouTube Quiz / LMS Library

Most LMS (Learning Management Systems) are too complex or expensive to use for a single video with a couple of questions.
Using the YouTube API I developed a LMS where you can specify which YouTube video to use and which questions to ask at which point within the video.

# How to use
1. In index.htm set the videoId to the id of the YouTube video you want to use.
2. Update js/questions.js with your own questions and answers.
3. Setup an API Endpoint and configure your endpoint in js/yt-quiz.js SendResult() method.
4. Send out invites to users with an additional parameter to the url to keep track of all the users that did your quiz. Parameter to use:  ?email=<email-address>, ex. http://example.com/index.htm?email=a.friend@example.com
  
- done!
    
# Example of MVC API Endpoint
 ```csharp
        public class Model
        {
            public string email { get; set; }
            public int total { get; set; }
            public int correct { get; set; }
            public double percentage { get; set; }
            public double viewed { get; set; }
        }

        [System.Web.Mvc.HttpPost]

        public async Task<JsonResult> QuizResult(Model model)
        {
        } 
 ```
