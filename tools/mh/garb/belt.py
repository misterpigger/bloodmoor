# a leather belt round a draped garment at its belt line: a band laid on the cloth's outer surface, an iron buckle at the front with
# the strap's end hanging from it, as a part like the others (assets/mhparts/belt_<g>.bin)
import os
import sys,json,numpy as np
sys.path.insert(0,'$(dirname $0)')
import gar2bin
SC=gar2bin.SC
def belt(g,by,builds='ABCD',w=.042,n=96):
    for b in builds:
        d=np.load(SC+'gar_%s_%s.npz'%(g,b));V=d['V'];m=np.abs(V[:,1]-by)<.03;Q=V[m];c=np.array([Q[:,0].mean(),Q[:,2].mean()])
        ang=np.arctan2(Q[:,2]-c[1],Q[:,0]-c[0]);rad=np.hypot(Q[:,2]-c[1],Q[:,0]-c[0]);bins=np.linspace(-np.pi,np.pi,n+1);R=np.zeros(n)
        for i in range(n):
            s=(ang>=bins[i])&(ang<bins[i+1]);R[i]=rad[s].max() if s.any() else np.nan
        ok=~np.isnan(R);A=(bins[:-1]+bins[1:])/2;R=np.interp(A,A[ok],R[ok],period=2*np.pi)
        for _ in range(3):R=(np.roll(R,1)+R*2+np.roll(R,-1))/4
        R+=.007;P=[];F=[]
        tilt=lambda a:.012*np.cos(a-np.pi/2)   # sits a little lower at the front, as a belt does over the belly
        for k,(a,r) in enumerate(zip(A,R)):
            x,z=c[0]+r*np.cos(a),c[1]+r*np.sin(a);yy=by-tilt(a)
            P+= [[x,yy+w/2,z],[x,yy-w/2,z]]
        for k in range(n):
            a0,a1=2*k,2*((k+1)%n);F+=[[a0,a1,a0+1],[a1,a1+1,a0+1]]
        # the buckle: a flat iron frame at the front, a little to the wearer's left; the strap's end hangs from it
        kb=np.argmin(np.abs(A-(np.pi/2-.25)));bx,bz=c[0]+(R[kb]+.004)*np.cos(A[kb]),c[1]+(R[kb]+.004)*np.sin(A[kb]);byy=by-tilt(A[kb])
        nx,nz=np.cos(A[kb]),np.sin(A[kb]);tx,tz=-nz,nx;base=len(P)
        for dx,dy in [(-.026,-.028),(.026,-.028),(.026,.028),(-.026,.028),(-.019,-.02),(.019,-.02),(.019,.02),(-.019,.02)]:
            P.append([bx+tx*dx,byy+dy,bz+tz*dx])
        for i in range(4):
            j=(i+1)%4;F+=[[base+i,base+j,base+4+i],[base+j,base+4+j,base+4+i]]
        # the tongue end hanging down 18 cm
        base=len(P);ex,ez=bx-tx*.03,bz-tz*.03
        for t,dy in enumerate(np.linspace(0,-.2,6)):
            sw=.0+.004*t
            P+= [[ex-tx*.016+nx*sw*.3,byy+dy,ez-tz*.016+nz*sw*.3],[ex+tx*.016+nx*sw*.3,byy+dy,ez+tz*.016+nz*sw*.3]]
        for t in range(5):a0=base+2*t;F+=[[a0,a0+2,a0+1],[a0+2,a0+3,a0+1]]
        np.savez(SC+'gar_belt_%s_%s.npz'%(g,b),V=np.array(P,np.float32),F=np.array(F))
    gar2bin.write('belt_'+g,builds,kind='belt')
if __name__=='__main__':belt(sys.argv[1],float(sys.argv[2]),sys.argv[3] if len(sys.argv)>3 else 'ABCD')
