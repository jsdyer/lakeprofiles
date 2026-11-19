from collections import defaultdict
import math
from source import records, day, save

LAYER = 'LakeWatchers_OD_View/FeatureServer/'
SITES = {'BAN_SD':'Lake Banook','ALBRO_SD':'Albro Lake'}

def main():
    where = " IN ('BAN_SD','ALBRO_SD')"
    profiles = defaultdict(list)
    stations = records(LAYER+'0','MON_SITE'+where,'MON_SITE,LATITUDE,LONGITUDE')
    if sorted(s['MON_SITE'] for s in stations) != sorted(SITES):
        raise ValueError('Missing monitoring station')
    readings = records(LAYER+'43',"MONLOCID"+where+" AND SAMPTYPE='D'",'MONLOCID,MON_DATE,DEPTH,DO,TEMP,INSTRUMT')
    for r in readings:
        if r['DEPTH'] is None or (r['DO'] is None and r['TEMP'] is None):
            continue
        if r['DEPTH'] > 0 or not math.isfinite(r['DEPTH']):
            raise ValueError('Unexpected depth convention')
        profiles[r['MONLOCID']].append([day(r['MON_DATE']),abs(r['DEPTH']),r['DO'],r['TEMP'],r['INSTRUMT']])
    result=[]
    for s in stations:
        code=s['MON_SITE']
        values=sorted(profiles[code],key=lambda r:(r[0],r[1]))
        if len({v[0] for v in values}) < 2:
            raise ValueError('Incomplete profile history')
        result.append(dict(code=code,name=SITES[code],lat=s['LATITUDE'],lon=s['LONGITUDE'],values=values))
    dates=[v[0] for s in result for v in s['values']]
    save('profiles.json',count=len(dates),start=min(dates),end=max(dates),stations=sorted(result,key=lambda s:s['name']))
if __name__=='__main__': main()
