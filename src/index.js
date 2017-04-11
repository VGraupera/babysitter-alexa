'use strict';

var Alexa = require('alexa-sdk');

exports.handler = function(event, context, callback) {
    console.log(JSON.stringify(event, null, 2));

    var alexa = Alexa.handler(event, context);
    if ('undefined' === typeof process.env.DEBUG) {
      // alexa.appId = 'amzn1.ask.skill.f496e2f2-49f0-4c66-9b71-1589762eb269';
    }
    alexa.resources = languageStrings;
    alexa.dynamoDBTableName = 'babysitterUsers';
    alexa.registerHandlers(handlers);
    alexa.execute();
};

// TODO: Handle Invalid Custom Slot Type Values
function getParentName(event) {
  var parentSlot = event.request.intent.slots.Parent;
  var parentName = '';
  if (parentSlot && parentSlot.value) {
      parentName = parentSlot.value.toLowerCase();
  }
  return parentName;
}

var handlers = {
    'LaunchRequest': function () {
        console.log("Launch w/attributes - " + JSON.stringify(this.attributes, null, 2));

        this.attributes['speechOutput'] = this.t("WELCOME_MESSAGE", this.t("SKILL_NAME"));
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes['repromptSpeech'] = this.t("WELCOME_REPROMPT");
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'GetPhone': function () {
        // if parent empty then render help
        if (!(this.event.request.intent.slots.Parent &&
            this.event.request.intent.slots.Parent.value)) {
          this.emit(':tell', this.t("HELP_MESSAGE"));
          return;
        }

        var parentName = getParentName(this.event);

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
        // if parent and phone are empty then render help
        if (!this.event.request.intent.slots.Parent &&
            !this.event.request.intent.slots.Phone) {
          this.emit(':tell', this.t("HELP_MESSAGE"));
          return;
        }

        var parentName = getParentName(this.event);
        var phoneValue = this.event.request.intent.slots.Phone &&
                          this.event.request.intent.slots.Phone.value;

        if (!phoneValue) {
          this.emit(':tell', this.t("NO_PHONE_MESSAGE"));
        }
        else {
          var phoneString = "<say-as interpret-as='telephone'>"+phoneValue+"</say-as>";
          var speechOutput = this.t("SET_PHONE_MESSAGE", parentName, phoneString);

          this.attributes['speechOutput'] = speechOutput;
          this.attributes['phone'] = phoneValue;
          this.attributes['phone-'+parentName] = phoneValue;

          this.emit(':tell', speechOutput);
          console.log("Persisting attributes - " + JSON.stringify(this.attributes, null, 2));
          this.emit(':saveState', true); // force save
        }
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
        console.log('SessionEndedRequest');
        this.emit(':tell', this.t("STOP_MESSAGE"));
        console.log("Persisting attributes - " + JSON.stringify(this.attributes, null, 2));
        this.emit(':saveState', true);
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
