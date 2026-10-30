G=$(dirname $0)
cd /tmp
for g in ${GS:-cote shirt doublet aketon}; do for b in A B C D; do
  timeout 1800 $G/../bpyenv/bin/python $G/bl_garment.py $g $b 2>&1 | grep -v "^Read\|^$\|Warning" | tail -1
done; python3 $G/gar2bin.py $g ABCD; done
python3 $G/belt.py cote .97 ABCD; python3 $G/belt.py shirt .97 ABCD; python3 $G/belt.py doublet .93 ABCD
echo ALLDONE
