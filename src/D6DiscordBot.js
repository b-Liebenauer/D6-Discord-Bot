require('dotenv').config();
const {Client, IntentsBitField} = require('discord.js');

const client = new Client({
    intents : [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.on('ready', (c) =>{
    console.log('Waiting on a command');
});


client.on('messageCreate', (message) => {
    if (message.author.bot || !message.content.startsWith('?') || message.content.length == 1)
    {
        return;
    }
    //Allows the user to type spaces in the command without them affecting any indexing
    while (message.content.includes(' '))
    {
        message.content = message.content.replace(' ','');
    }
    //Holds the format type of the roll
    var messageType = DeformatRollDisplayType(message.content);
    //Holds the type of roll
    var rollType;
    //holds the data about the plus in the input string. [0][0] is if it exists, [0][1] is index in string
    var plusArray = [];
    //plus exists or not
    var plusBool;

    if (messageType === 0)
    {
        //Checking for valid message format type
        message.reply('\'?\' detected, but missing display format. See bot-commands-guide for details');
        return;
    }
    else if (messageType === -1)
    {
        //Checking for valid message format type
        message.reply('\'?\' and display format(\'a\',\'t\', or \'o\') detected, but missing \':\' after display format. See bot-commands-guide for details');
        return;
    }
    else
    {
        rollType = DeformatRollType(message.content, messageType);
        plusArray.push(plusCheck(message.content));
    }
    if (rollType[0][0] === 0)
    {
        //Checking for valid roll type
        message.reply('\'?\' and display format(\'a\',\'t\', or \'o\') detected, but the rest of the command is incorrectly formatted. See bot-commands-guide for details');
        return;
    }
    if (plusArray[0][0] === 1)
    {
        //Making sure plus number is whole
        if (parseFloat(message.content.substring(plusArray[0][1])) % 1 != 0 ||  parseInt(message.content.substring(plusArray[0][1])) <= 0)
        {
            message.reply('Positive, whole numbers only, retard');
            return;
        }
        //Makes sure '+' is at the end of the command
        if (rollType[0][1] > plusArray[0][1])
        {
            message.reply('\'?\', display format(\'a\',\'t\', or \'o\'), and \'+\' detected, but \'+\' is incorrectly formatted. See bot-commands-guide for details');
            return;
        }
        plusBool = true;
    }
    //Holds the initial rolls and explosions
    var sixesArray = [];
    
    //Holds the number of rolls requested by the user
    var rolls;

    //1 is advantage, 2 is disadvantage, 3 is glory, 4 is normal
    switch (rollType[0][0])
    {
        case 1:
            //Getting number of rolls
            if (plusBool)
            {
                rolls = message.content.substring(rollType[0][1] + 3, plusArray[0][1]);
            }
            else
            {
                rolls = message.content.substring(rollType[0][1] + 3);
            }
            //Positive and whole number check
            if ((parseFloat(rolls) % 1 != 0)  || (parseInt(rolls) <= 0))
            {
                message.reply('Positive, whole numbers only, retard');
                return;
            }
            //Max limit check
            if (parseInt(rolls) > 50)
            {
                message.reply('You are trying to roll too many dice at once. Please roll no more than 50 dice at a time');
                return;
            }
            sixesArray = AdvantageRolls(rolls);
            break;
        case 2:
            //Getting number of rolls
            if (plusBool)
            {
                rolls = message.content.substring(rollType[0][1] + 3, plusArray[0][1]);
            }
            else
            {
                rolls = message.content.substring(rollType[0][1] + 3);
            }
            //Positive and whole number check
            if ((parseFloat(rolls) % 1 != 0)  || (parseInt(rolls) <= 0))
            {
                message.reply('Positive, whole numbers only, retard');
                return;
            }
            //Max limit check
            if (parseInt(rolls) > 50)
            {
                message.reply('You are trying to roll too many dice at once. Please roll no more than 50 dice at a time');
                return;
            }
            //Must push the result of DisadvantageRolls(rolls), as it is a 1D array and causes issues with iterating otherwise
            sixesArray.push(DisadvantageRolls(rolls));
            break;
        case 3:
            //Getting number of rolls
            if (plusBool)
            {
                rolls = message.content.substring(rollType[0][1] + 1, plusArray[0][1]);
            }
            else
            {
                rolls = message.content.substring(rollType[0][1] + 1);
            }
            //Positive and whole number check
            if ((parseFloat(rolls) % 1 != 0)  || (parseInt(rolls) <= 0))
            {
                message.reply('Positive, whole numbers only, retard');
                return;
            }
            //Max limit check
            if (parseInt(rolls) > 50)
            {
                message.reply('You are trying to roll too many dice at once. Please roll no more than 50 dice at a time');
                return;
            }
            sixesArray = GloryRolls(rolls);
            break;
        case 4:
            //Getting number of rolls
            if (plusBool)
            {
                rolls = message.content.substring(rollType[0][1] + 1, plusArray[0][1]);
            }
            else
            {
                rolls = message.content.substring(rollType[0][1] + 1);
            }
            //Positive and whole number check
            if ((parseFloat(rolls) % 1 != 0)  || (parseInt(rolls) <= 0))
            {
                message.reply('Positive, whole numbers only, retard');
                return;
            }
            //Max limit check
            if (parseInt(rolls) > 50)
            {
                message.reply('You are trying to roll too many dice at once. Please roll no more than 50 dice at a time');
                return;
            }
            sixesArray = NormalRolls(rolls);
            break;
    }
    var outputString = '';
    //Formats the rolls based on the format type
    outputString = FormatRolls(sixesArray, messageType);
    //Adds the number of sixes the user wants to the total amount of sixes rolled
    if (plusBool)
    {
        var totalCountIndex = outputString.indexOf('Total number of six(es)');
        var totalCount = parseInt(outputString.substring(totalCountIndex + 26)) + parseInt(message.content.substring(plusArray[0][1]));
        outputString = outputString.substring(0, totalCountIndex + 26);
        outputString += totalCount;
    }
    message.reply(outputString);
    return;
})

//Normal rolls are rolls where sixes explode once until there are no more sixes
function NormalRolls(rolls)
{
    var currentRolls = rolls;
    var sixes = true;
    var allRollsArray = [];
    var currentRollsArray = [];
    var lastSixes = 0;
    while (sixes)
    {
        for (let i = 0; i < currentRolls; i++)
        {
            var currentRoll = Math.floor(Math.random() * 6) + 1;
            currentRollsArray.push(currentRoll);
            if (currentRoll == 6)
            {
                lastSixes++;
            }
        }
        if (lastSixes > 0)
        {
          currentRolls = lastSixes;
          allRollsArray.push(currentRollsArray);
          currentRollsArray = [];
          lastSixes = 0;
        }
        else
        {
            allRollsArray.push(currentRollsArray);
            sixes = false;
        }
    }
    return allRollsArray;
}

//Glory rolls are rolls where sixes explode the whole roll [number of sixes] + 1 times, but the dice with sixes on them aren't exploded
function GloryRolls(rolls)
{
    var currentRolls = rolls;
    var allRollsArray = [];
    var currentRollsArray = [];
    var lastSixes = 0;
        for (let i = 0; i < currentRolls; i++)
        {
            var currentRoll = Math.floor(Math.random() * 6) + 1;
            currentRollsArray.push(currentRoll);
            if (currentRoll == 6)
            {
                lastSixes++;
            }
        }
        if (lastSixes > 0)
        {
          currentRolls -= lastSixes;
          allRollsArray.push(currentRollsArray);
          currentRollsArray = [];
          for (let i = 0; i < lastSixes + 1; i++)
          {
            allRollsArray.push(DisadvantageRolls(currentRolls));
          }
        }
        else
        {
            allRollsArray.push(currentRollsArray);
        }
    return allRollsArray;
}

//Disadvantage rolls are rolls where no sixes explode
function DisadvantageRolls(rolls)
{
    var currentRolls = rolls;
    var currentRollsArray = [];
    for (let i = 0; i < currentRolls; i++)
    {
        var currentRoll = Math.floor(Math.random() * 6) + 1;
        currentRollsArray.push(currentRoll);
    }
    return currentRollsArray;
}

//Advantage rolls are rolls where every six explodes twice
function AdvantageRolls(rolls)
{
    var currentRolls = rolls;
    var sixes = true;
    var allRollsArray = [];
    var currentRollsArray = [];
    var lastSixes = 0;
    while (sixes)
    {
        for (let i = 0; i < currentRolls; i++)
        {
            var currentRoll = Math.floor(Math.random() * 6) + 1;
            currentRollsArray.push(currentRoll);
            if (currentRoll == 6)
            {
                lastSixes += 2;
            }
        }
        if (lastSixes > 0)
        {
          currentRolls = lastSixes;
          allRollsArray.push(currentRollsArray);
          currentRollsArray = [];
          lastSixes = 0;
        }
        else
        {
            allRollsArray.push(currentRollsArray);
            sixes = false;
        }
    }
    return allRollsArray;
}

//Formats the rolls / output based on the user's commands. 'o' only prints the total number of sixes, 't' prints the number of sixes in the initial roll, each explosion,
//and the total number of sixes, and 'a' prints every single roll, and the total number of sixes
function FormatRolls(rollsArray, format)
{
    var totalSixes = 0;
    var output = '';
    if (format === 3)
    {
        for (let i = 0; i < rollsArray.length; i++)
        {
            if (i == 0)
            {
                output += "Initial Roll(s) : ";
            }
            else
            {
                output += "Explosion " + i + " : ";
            } 
            for (let j = 0; j < rollsArray[i].length; j++)
            {
                if (j != rollsArray[i].length - 1)
                {
                    output += rollsArray[i][j] + ', ';
                }  
                else
                {
                    output += rollsArray[i][j]
                }
                if (rollsArray[i][j] == 6)
                {
                    totalSixes++;
                }
            }
            output += '\n';
        }
        output += 'Total number of six(es) : ' + totalSixes;
        return output;
    }
    else if (format === 2)
    {
        var currentSixes = 0;
        for (let i = 0; i < rollsArray.length; i++)
        {
            if (i == 0)
            {
                output += "Initial Roll(s) had ";
            }
            else
            {
                output += "Explosion " + i + " had ";
            } 
            for (let j = 0; j < rollsArray[i].length; j++)
            {
                if (rollsArray[i][j] == 6)
                {
                    totalSixes++;
                    currentSixes++;
                }
            }
            output += currentSixes + ' six(es). ';
            currentSixes = 0;
        }
        output += 'Total number of six(es) : ' + totalSixes;
        return output;
    }
    else if (format === 1)
    {
        for (let i = 0; i < rollsArray.length; i++)
        {
            for (let j = 0; j < rollsArray[i].length; j++)
            {
                if (rollsArray[i][j] == 6)
                {
                    totalSixes++;
                }
            }
        }
        output += 'Total number of six(es) : ' + totalSixes;
        return output;
    }
}

//Checks for a valid format type and for a ':'
function DeformatRollDisplayType(message)
{
    //'a' at 1 means that all rolls should be displayed
    if (message.charAt(1) === 'a')
    {
        if (message.charAt(2) != ':')
        {
            return -1;
        }
        return 3;
    }
    else if (message.charAt(1) === 't')
    {
        //'t' at 1 means that only the total amount of sixes should be displayed for initial rolls, explosions, and overall
        if (message.charAt(2) != ':')
        {
            return -1;
        }
        return 2;
    }
    else if (message.charAt(1) === 'o')
    {
        //'o' means only the the total total amount of sixes should be displayed
        if (message.charAt(2) != ':')
        {
            return -1;
        }
        return 1;
    }
    return 0;
 
}

//Finds the display type requested by the user, puts that type into an array at [0][0], then loads the starting index of the display type at [0][1]
function DeformatRollType(message, format)
{
    var messageSubstring = message.substring(3);
    var rollTypeArray = [];
    //Must check for 'adv' and 'dis' first in order to make sure other commands that are substrings of 'adv' and 'dis' aren't caught first
    if (messageSubstring.includes('adv'))
    {
        var advArray = [];
        advArray.push(1);
        advArray.push(messageSubstring.indexOf('adv') + 3);
        rollTypeArray.push(advArray);
    }
    else if (messageSubstring.includes('dis'))
    {
        var disArray = [];
        disArray.push(2);
        disArray.push(messageSubstring.indexOf('dis') + 3);
        rollTypeArray.push(disArray);
    }
    else if (messageSubstring.includes('g'))
    {
        var gArray = [];
        gArray.push(3);
        gArray.push(messageSubstring.indexOf('g') + 3);
        rollTypeArray.push(gArray);
    }
    else if (messageSubstring.includes('n'))
    {
        var nArray = [];
        nArray.push(4);
        nArray.push(messageSubstring.indexOf('n') + 3);
        rollTypeArray.push(nArray);
    }
    else
    {
        //If no valid display type was found, return an error
        var errorArray = [0,0]
        rollTypeArray.push(errorArray);
    }
    return rollTypeArray;
}

//Checks for a plus, and if so, return 1 in an array at [0][0] and the index of the plus at [0][1]
function plusCheck(message)
{
    if (message.substring(3).includes('+'))
    {
        var plusNumber = message.substring(3).indexOf('+') + 3;
        var tempArray = [1, plusNumber];
        return tempArray;
    }
    else
    {
        var tempArray = [0,0];
        return tempArray;
    }
}

client.login(process.env.TOKEN);

function IsNumber(char) {
    return /^\d$/.test(char);
}


