The commands follow this pattern : '?[format type]:[roll type][number of rolls]' (no quotation marks).
You can also add '+[number of 6's to add]' to the end to add a certain number of 6's to the total for the roll
The format types are as follows :
'a' will show you every single roll, plus the total number of 6's rolled
't' will show you the number of 6's rolled for the initial roll and each explosion, as well as the total number of 6's rolled
'o' will just show you the total number of 6's for all rolls
If you have trouble remembering all of these, just think of them as 'a' for 'all', 't' for 'totals', and 'o' for 'one' 
The roll types are as follows :
'dis', for disadvantage roll, will roll the initial roll and not explode any 6's 
'adv', for advantage roll, will roll the initial roll and explode every 6 twice 
'n', for normal roll, will roll the initial roll and explode 6's normally
'g', for glory roll, will roll the initial roll, count the number of 6's, remove the 6's rolled from the rest of the dice, and explode all remaining dice a number of times equal to the number of 6's rolled in the initial roll, but not explode any more 6's past the initial roll 
You will combine a format type, roll type, and number of rolls to create a command
For example, '?a:n7' will be a normal roll, will roll 7 dice, and will show you every single roll
'?o:g10+2' will be a glory roll that will roll ten 10, explode them, count up the 6's, add 2 to the total, then print out just the number of 6's
Your commands will be invalid if you try to use a decimal, fraction, or negative number for the number of rolls, if the command isn't in the proper format, or if you try to roll more than 50 dice in your initial roll
If you have any questions, have any suggestions, find any bugs, feel free to reach out and let me know