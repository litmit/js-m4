divert(`1')diverted text`'divert
undivert()dnl do nothing
undivert(,)dnl do nothing
undivert(`0')dnl do nothing
undivert
divert(`1')more dnl
divert(`2')undivert(`1')diverted text`'divert
undivert(`1')dnl diversion already empty
undivert(`2')

divert(`1')one
divert(`2')two
divert(`3')three
divert(`2')undivert`'dnl undivert all diversion except #2 and put result to end of diversion #2
divert`'undivert
