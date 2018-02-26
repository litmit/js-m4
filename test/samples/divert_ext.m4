#normal output
now `divnum' is: divnum
divert(-100)skip -100
define(`old_divnum',divnum)
#ignored output
divert()now `divnum' is: divnum, was: old_divnum
#large integers caped to [MININT,MAXINT] range
divert(-5000000000)skip -5000000000
define(`old_divnum',divnum)
#ignored output
divert`'now `divnum' is: divnum, was: old_divnum
normal
divert(5q5)dnl not a numeric warning
test1
divert(5000000000)dnl
now `divnum' is: divnum
test huge 5000000000
divert`'dnl
normal
divert(3.14)dnl not a numeric warning
now `divnum' is: divnum
test2
divert(` 314 ')dnl not a numeric warning
now `divnum' is: divnum
test3
divert(2147483647)dnl
now `divnum' is: divnum
test large 2147483647
divert(2000000000)dnl
now `divnum' is: divnum
test large 2000000000
divert(1000000000)dnl
now `divnum' is: divnum
test large 1000000000
divert(199999999)dnl
now `divnum' is: divnum
test undiversion sort order for 199999999
divert`'dnl
normal
divert(3000000000)dnl
now `divnum' is: divnum
test huge 3000000000
divert`'dnl
normal
