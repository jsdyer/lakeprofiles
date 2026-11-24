# Lake Profiles

[Open Lake Profiles](https://coolcode.ca/lakeprofiles/). Compare real depth profiles across Halifax Regional Municipality.

<!-- coolcode:guide -->
Choose Lake Banook, compare April 18 and August 14, 2023 at 10 metres, and switch between oxygen and temperature. The plot and table include only measured depths.
<!-- /coolcode:guide -->

Every selection has a permanent link that restores both visits, the station, the metric and the measured depth.

## Sources and interpretation

<p>Data from the <a href="https://services2.arcgis.com/11XBiaBYA9Ep0yNJ/arcgis/rest/services/LakeWatchers_OD_View/FeatureServer/43">HRM LakeWatchers monitoring results</a> and station layer. Every municipal deep-water station with measured oxygen or temperature on at least two dates qualifies. The collector reads lake and basin names from the municipality’s station-code dictionary. Depths are shown as metres below the surface. Every marker is a recorded reading at one depth on one visit. A blank represents an unreported measurement. Repeated readings remain visible in the table. These profiles describe sampled water at the station. They do not establish swimming conditions.</p><p>Compare editions and coverage in <a href="https://doi.org/10.25976/85pw-zj92">HRM LakeWatchers on DataStream</a>. The snapshot uses the municipal ArcGIS source and can cover different dates. <a href="https://data-hrm.hub.arcgis.com/pages/open-data-licence">HRM Open Data Licence</a>.</p>

## Maintaining the tool

The published app reads its bundled JSON without contacting the municipality. A scheduled GitHub Action runs the collector, validates the result, and rebuilds Pages when the snapshot changes. Run `python3 scripts/refresh.py`, `node --test tests/*.test.mjs`, `python3 -m unittest discover -s tests`, then `python3 scripts/build.py`. Browser checks run against the built site at its repository subpath. The collector writes atomically after verifying complete ArcGIS ID batches.

<!-- schedule-reliability -->
## Schedule reliability

Public GitHub repositories can have scheduled workflows disabled after 60 days of inactivity. A separate weekly [schedule guard](.github/workflows/schedule-guard.yml) calls GitHub's enable-workflow API for an explicit list of refresh workflows and itself. It can restore workflows disabled for inactivity, preserves manually disabled workflows, and runs independently of collection failures.

This is an interim mitigation, not a scheduling guarantee: GitHub does not document active-workflow renewal as a permanent exemption, and scheduled runs can be delayed or dropped. A scheduler on our own Linux server is the planned independent trigger. The guard does not collect data, create dummy commits, or change source/check timestamps; successful collection and published data freshness still need monitoring.
<!-- /schedule-reliability -->
