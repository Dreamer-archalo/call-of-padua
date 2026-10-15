using NUnit.Framework;
using UnityEngine;
using CallOfPadua.World;

public class DistrictWorldTests
{
    [Test]
    public void PolygonContains_InteriorExteriorAndEdge()
    {
        var polygon = new[] {new Vector2(0, 0), new Vector2(20, 0), new Vector2(20, 10), new Vector2(0, 10)};
        Assert.That(DistrictWorld.Contains(polygon, new Vector2(5, 5)), Is.True);
        Assert.That(DistrictWorld.Contains(polygon, new Vector2(25, 5)), Is.False);
        Assert.That(DistrictWorld.Contains(polygon, new Vector2(0, 5)), Is.True);
        Assert.That(DistrictWorld.Contains(System.Array.Empty<Vector2>(), new Vector2(0, 0)), Is.False);
    }

    [Test]
    public void EmptyWorld_RefusesTraversal()
    {
        var go = new GameObject("district-world-test");
        try
        {
            var world = go.AddComponent<DistrictWorld>();
            Assert.That(world.Locate(Vector3.zero), Is.EqualTo(DistrictId.Outside));
            Assert.That(world.CanEnter(Vector3.zero), Is.False);
            Assert.That(world.TryMove(Vector3.zero, Vector3.right, out var accepted), Is.False);
            Assert.That(accepted, Is.EqualTo(Vector3.zero));
        }
        finally { Object.DestroyImmediate(go); }
    }

    [Test]
    public void Save_RoundTripFaction()
    {
        var go = new GameObject("district-save-test");
        try
        {
            var world = go.AddComponent<DistrictWorld>();
            world.SetOwner(DistrictId.Portello, Faction.Militia);
            string json = world.ExportSave();
            world.SetOwner(DistrictId.Portello, Faction.Survivors);
            world.ImportSave(json);
            Assert.That(world.OwnerOf(DistrictId.Portello), Is.EqualTo(Faction.Militia));
        }
        finally { Object.DestroyImmediate(go); }
    }
}
