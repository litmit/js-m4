# http://www.gnu.org/software/m4/manual/m4.html#Indir
1 m4_define(`define', `nodefine')
2 m4_define(`m4_define', `nodefine')
3 m4_define(`foo', `BAR')
4 foo
5 m4_builtin(`define')
6 m4_builtin(`define', `foo')
7 foo
8 m4_builtin(`define', `foo',)
9 foo
10 m4_builtin(`define', `foo', `BAR')
11 foo
