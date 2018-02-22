# https://www.gnu.org/software/m4/manual/m4.html#Undefine
1 foo bar blah
2 define(`foo', `some')define(`bar', `other')define(`blah', `text')
3 foo bar blah
4 undefine(`foo')
5 foo bar blah
6 undefine(`bar', `blah')
7 foo bar blah
8 define(`f', ``$0':$1')
9 f(f(f(undefine(`f')`hello world')))
10 f(`bye')
