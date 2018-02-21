# http://www.gnu.org/software/m4/manual/m4.html#Indir
1 define(`define', `nodefine')
2 define(`foo', `BAR')
3 foo
4 builtin(`define')
5 builtin(`define', `foo')
6 foo
7 builtin(`define', `foo',)
8 foo
9 builtin(`define', `foo', `BAR')
10 foo
