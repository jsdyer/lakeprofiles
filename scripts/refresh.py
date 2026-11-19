"""Publish comparable deep-water visits from HRM's LakeWatchers monitoring network."""
from collections import defaultdict
import math
from source import records, query, day, save

LAYER = "LakeWatchers_OD_View/FeatureServer/"

def main():
    metadata = query(LAYER + "0", metadata=True)
    field = next(f for f in metadata["fields"] if f["name"] == "MON_SITE")
    names = {v["code"]: v["name"].removesuffix(" Deep Water")
             for v in field["domain"]["codedValues"] if v["code"].endswith("_SD")}
    stations = records(LAYER + "0", "1=1", "MON_SITE,LATITUDE,LONGITUDE")
    sites = {s["MON_SITE"]: s for s in stations if s["MON_SITE"].endswith("_SD")}
    profiles = defaultdict(list)
    readings = records(LAYER + "43", "SAMPTYPE='D'", "MONLOCID,MON_DATE,DEPTH,DO,TEMP,INSTRUMT")
    for r in readings:
        if r["DEPTH"] is None or (r["DO"] is None and r["TEMP"] is None):
            continue
        if not r["MONLOCID"].endswith("_SD"):
            continue
        if r["MONLOCID"] not in sites or r["MONLOCID"] not in names:
            raise ValueError(f"Unknown deep-water station {r['MONLOCID']}")
        if r["DEPTH"] > 0 or not math.isfinite(r["DEPTH"]):
            raise ValueError(f"Unexpected depth convention {r}")
        profiles[r["MONLOCID"]].append(
            [day(r["MON_DATE"]), abs(r["DEPTH"]), r["DO"], r["TEMP"], r["INSTRUMT"]]
        )
    result = []
    for code, values in profiles.items():
        if len({v[0] for v in values}) < 2:
            continue
        s = sites[code]
        result.append(dict(code=code, name=names[code], lat=s["LATITUDE"], lon=s["LONGITUDE"],
                           values=sorted(values, key=lambda r: (r[0], r[1]))))
    if len(result) < 30 or not {"BAN_SD", "ALBRO_SD"}.issubset(v["code"] for v in result):
        raise ValueError("Incomplete municipal station coverage")
    dates = [v[0] for s in result for v in s["values"]]
    save("profiles.json", count=len(dates), start=min(dates), end=max(dates),
         stations=sorted(result, key=lambda s: s["name"]))

if __name__ == "__main__":
    main()
