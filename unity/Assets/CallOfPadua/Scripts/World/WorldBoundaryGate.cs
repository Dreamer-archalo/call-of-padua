using UnityEngine;

namespace CallOfPadua.World
{
    /// <summary>
    /// Gate placed at a real street boundary. Required for playable->background transition.
    /// A non-physical notice complements, rather than substitutes, collision at accessible roads.
    /// </summary>
    public sealed class WorldBoundaryGate : MonoBehaviour
    {
        [TextArea] public string reason = "Strada interrotta. Quest'area sarà esplorabile più avanti.";
        [SerializeField] private GameObject visibleRoadblock;
        public event System.Action<string> GateReached;
        private void Awake()
        {
            if (visibleRoadblock == null)
                Debug.LogWarning("Boundary gate is missing a visual barrier", this);
        }
        private void OnTriggerEnter(Collider other)
        {
            if (other.CompareTag("Player")) GateReached?.Invoke(reason);
        }
    }
}
