"""Build per-station readings from Halifax's municipal deep-water sampling visits."""
from html import escape
import json
from urllib.parse import urlencode
from result_pages import link, publish, slug, table


def measured(value):
    return "Unreported" if value is None else f"{value:g}"


def publish_profiles(stage, tool):
    data = json.loads((stage / "data/profiles.json").read_text())
    records = []
    for station in data["stations"]:
        values = station["values"]
        dates = sorted({row[0] for row in values})
        if len(dates) < 2:
            continue
        latest = dates[-1]
        recent = sorted((r for r in values if r[0] == latest), key=lambda r: r[1])
        name, code = station["name"], station["code"]
        title = f"{name} dissolved oxygen and water temperature"
        intro = (f"Halifax LakeWatchers sampled station {code} on {len(dates)} dates from {dates[0]} to {latest}. "
                 f"The most recent profile reaches {recent[-1][1]:g} metres below the surface.")
        rows = [(measured(depth), measured(oxygen), measured(temp), instrument or "Unreported")
                for _, depth, oxygen, temp, instrument in recent]
        body = table(f"Measurements on {latest} at {name}", ["Depth (m)", "Oxygen (mg/L)", "Temperature (°C)", "Instrument"], rows)
        query = urlencode({"station": code, "first": dates[-2], "second": latest})
        body += '<p>' + link(tool["url"] + "?" + query, f"Compare the {dates[-2]} and {latest} water profiles") + '</p>'
        body += (f'<h2>Sampling history</h2><p>{escape(", ".join(dates))}.</p>'
                 f'<p>Snapshot retrieved {escape(data["retrieved"])}. Repeated measurements at a depth are preserved. '
                 'The measurements describe the sampled water at this station and depth.</p><p>'
                 + link('https://services2.arcgis.com/11XBiaBYA9Ep0yNJ/arcgis/rest/services/LakeWatchers_OD_View/FeatureServer/43',
                        'Halifax Regional Municipality monitoring results') + ' · '
                 + link('https://data-hrm.hub.arcgis.com/pages/open-data-licence', 'HRM Open Data Licence') + '</p>')
        records.append((slug(code), name + " (" + code + ")", title, intro, body))
    publish(stage, tool, "stations", "Halifax lake water profiles by monitoring station",
            "Find a Halifax-area lake to see dated dissolved oxygen and temperature readings at measured depths.", records)
