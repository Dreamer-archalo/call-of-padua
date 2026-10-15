using System;
using System.Collections.Generic;
using UnityEngine;

namespace CallOfPadua.World
{
    public enum DistrictId { CentroStorico, Portello, Forcellini, SantaRita, MadonnaPellegrina, CittaGiardino, Outside }
    public enum Faction { Neutral, Survivors, Militia, Infected }

    [Serializable]
    public class DistrictDefinition
    {
        public DistrictId id;
        public string displayName;
        public bool playable;
        public Vector2[] polygon = Array.Empty<Vector2>(); // world coordinates X,Z in metres
    }

    [Serializable]
    public class DistrictState
    {
        public DistrictId id;
        public Faction owner = Faction.Neutral;
        [Range(0, 100)] public int alert;
        public int supplies;
    }

    [Serializable]
    public class DistrictSave
    {
        public int version = 1;
        public List<DistrictState> districts = new List<DistrictState>();
    }

    /// <summary>
    /// No fabricated boundaries: an empty/invalid polygon is never considered playable.
    /// Keep accurate cartographic conversion and mesh positioning in the map importer.
    /// </summary>
    public sealed class DistrictWorld : MonoBehaviour
    {
        [SerializeField] private List<DistrictDefinition> definitions = new List<DistrictDefinition>();
        [SerializeField] private List<DistrictState> states = new List<DistrictState>();
        [SerializeField] private bool enforceBoundary = true;
        public event Action<DistrictId, Faction> TerritoryChanged;
        public IReadOnlyList<DistrictDefinition> Definitions => definitions;

        public DistrictId Locate(Vector3 point)
        {
            var p = new Vector2(point.x, point.z);
            foreach (var d in definitions)
                if (d.polygon != null && d.polygon.Length >= 3 && Contains(d.polygon, p)) return d.id;
            return DistrictId.Outside;
        }

        public bool CanEnter(Vector3 point)
        {
            if (!enforceBoundary) return true; // Editor debugging only.
            var district = Locate(point);
            foreach (var d in definitions)
                if (d.id == district) return d.playable;
            return false;
        }

        public bool TryMove(Vector3 current, Vector3 proposed, out Vector3 accepted)
        {
            if (CanEnter(proposed)) { accepted = proposed; return true; }
            // Reject only the blocked axis when possible; no teleport through inaccessible geometry.
            var x = new Vector3(proposed.x, current.y, current.z);
            var z = new Vector3(current.x, current.y, proposed.z);
            if (CanEnter(x)) { accepted = x; return false; }
            if (CanEnter(z)) { accepted = z; return false; }
            accepted = current;
            return false;
        }

        public void SetOwner(DistrictId id, Faction faction)
        {
            if (id == DistrictId.Outside) throw new ArgumentOutOfRangeException(nameof(id));
            var state = states.Find(s => s.id == id);
            if (state == null) { state = new DistrictState { id = id }; states.Add(state); }
            if (state.owner == faction) return;
            state.owner = faction;
            TerritoryChanged?.Invoke(id, faction);
        }

        public Faction OwnerOf(DistrictId id)
        {
            var state = states.Find(s => s.id == id);
            return state == null ? Faction.Neutral : state.owner;
        }

        public string ExportSave() => JsonUtility.ToJson(new DistrictSave { districts = states });
        public void ImportSave(string json)
        {
            if (string.IsNullOrWhiteSpace(json)) throw new ArgumentException("Save is empty");
            var save = JsonUtility.FromJson<DistrictSave>(json);
            if (save == null || save.version != 1 || save.districts == null)
                throw new InvalidOperationException("Incompatible save data");
            foreach (var item in save.districts)
                if (item.id != DistrictId.Outside) SetOwner(item.id, item.owner);
        }

        public static bool Contains(Vector2[] polygon, Vector2 p)
        {
            if (polygon == null || polygon.Length < 3) return false;
            bool inside = false;
            for (int i = 0, j = polygon.Length - 1; i < polygon.Length; j = i++)
            {
                Vector2 a = polygon[i], b = polygon[j];
                var edge = b - a;
                var point = p - a;
                var cross = edge.x * point.y - edge.y * point.x;
                if (Mathf.Abs(cross) < 0.0001f && Vector2.Dot(point, edge) >= 0f && Vector2.Dot(p - b, a - b) >= 0f)
                    return true;
                if ((a.y > p.y) != (b.y > p.y) &&
                    p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
            }
            return inside;
        }

        private void OnValidate()
        {
            var seen = new HashSet<DistrictId>();
            foreach (var d in definitions)
            {
                if (d.id == DistrictId.Outside || !seen.Add(d.id))
                    Debug.LogError("Duplicate or invalid district ID", this);
                if (d.playable && (d.polygon == null || d.polygon.Length < 3))
                    Debug.LogWarning("Playable district lacks surveyed boundary: " + d.id, this);
            }
        }
    }
}
