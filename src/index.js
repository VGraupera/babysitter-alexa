'use strict';

var Alexa = require('alexa-sdk');

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    // alexa.appId = 'amzn1.ask.skill.f496e2f2-49f0-4c66-9b71-1589762eb269';
    alexa.resources = languageStrings;
    alexa.dynamoDBTableName = 'babysitterUsers';
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
     'NewSession': function() {
        // any previous session attributes are now loaded from Dynamo into the session attributes
        var todayNow = new Date();

        if(this.attributes['timestamp']) {  // user must have been here before
            var launchCount = this.attributes['launchCount'];
            this.attributes['launchCount'] = parseInt(launchCount) + 1;

        } else {  // first use
            this.attributes['launchCount'] = 0;
        }

        this.attributes['timestamp'] = todayNow;
        this.emit('LaunchRequest');
    },
    'LaunchRequest': function () {
        this.attributes['speechOutput'] = this.t("WELCOME_MESSAGE", this.t("SKILL_NAME"));
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes['repromptSpeech'] = this.t("WELCOME_REPROMPT");
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'GetPhone': function () {
        var parentSlot = this.event.request.intent.slots.Parent;
        var parentName;
        if (parentSlot && parentSlot.value) {
            parentName = parentSlot.value.toLowerCase();
        }

        if (this.attributes['phone']) {
          var phoneAttr = this.attributes['phone'];

          var phoneString = "<say-as interpret-as='telephone'>"+phoneAttr+"</say-as>";
          var speechOutput = this.t("GET_PHONE_MESSAGE", parentName, phoneString);
          var repromptSpeech = this.t("GET_PHONE_MESSAGE", parentName, phoneString);

          this.attributes['speechOutput'] = speechOutput;
          this.attributes['repromptSpeech'] = repromptSpeech;

          this.emit(':ask', speechOutput, repromptSpeech);
        } else {
          this.emit(':tell', this.t("NO_PHONE_MESSAGE"));
        }
    },
    'SetPhone': function () {
        var parentSlot = this.event.request.intent.slots.Parent;
        var parentName;
        if (parentSlot && parentSlot.value) {
            parentName = parentSlot.value.toLowerCase();
        }

        var phoneValue = this.event.request.intent.slots.Phone.value;
        this.attributes['phone'] = phoneValue;

        var phoneString = "<say-as interpret-as='telephone'>"+phoneValue+"</say-as>";

        var speechOutput = this.t("SET_PHONE_MESSAGE", parentName, phoneString);
        var repromptSpeech = this.t("SET_PHONE_MESSAGE", parentName, phoneString);

        this.attributes['speechOutput'] = speechOutput;
        this.attributes['repromptSpeech'] = repromptSpeech;

        this.emit(':ask', speechOutput, repromptSpeech);
    },
    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = this.t("HELP_MESSAGE");
        this.attributes['repromptSpeech'] = this.t("HELP_REPROMPT");
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest':function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    'Unhandled': function () {
        this.attributes['speechOutput'] = this.t("HELP_MESSAGE");
        this.attributes['repromptSpeech'] = this.t("HELP_REPROMPT");
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    }
};

var languageStrings = {
    "en": {
        "translation": {
            "SKILL_NAME": "Babysitter",
            "WELCOME_MESSAGE": "Welcome to %s. You can ask a question like, what\'s mom\'s phone number? or what\'s dad\'s phone? ... Now, what can I help you with.",
            "WELCOME_REPROMPT": "For instructions on what you can say, please say help me.",
            "HELP_MESSAGE": "You can ask questions such as, what\'s mom\'s phone number, or, you can say exit...Now, what can I help you with?",
            "HELP_REPROMPT": "You can say things like, what\'s mom\'s phone number, or you can say exit...Now, what can I help you with?",
            "STOP_MESSAGE": "Goodbye!",
            "GET_PHONE_MESSAGE": "%s phone is %s.",
            "SET_PHONE_MESSAGE": "%s phone set to %s.",
            "NO_PHONE_MESSAGE": "Phone has not been set.",
        }
    }
};
