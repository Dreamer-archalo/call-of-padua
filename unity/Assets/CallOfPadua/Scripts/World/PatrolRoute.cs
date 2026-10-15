using System;
using UnityEngine;
using UnityEngine.AI;

namespace CallOfPadua.World
{
    /// <summary>NavMesh-driven patrol with predictable waits and local avoidance.</summary>
    [RequireComponent(typeof(NavMeshAgent))]
    public sealed class PatrolRoute : MonoBehaviour
    {
        [SerializeField] private Transform[] waypoints = Array.Empty<Transform>();
        [SerializeField, Min(0f)] private float waitSeconds = 3f;
        [SerializeField, Min(0.1f)] private float arrivalDistance = 0.75f;
        [SerializeField] private bool loop = true;
        [SerializeField] private Animator animator;
        private NavMeshAgent agent;
        private int next;
        private float until;
        private bool waiting;
        void Awake() { agent = GetComponent<NavMeshAgent>(); }
        void OnEnable() { next = 0; waiting = false; until = 0; }
        void Update()
        {
            if (agent == null || !agent.isOnNavMesh || waypoints.Length == 0) return;
            if (waiting)
            {
                if (Time.time >= until) { waiting = false; Advance(); }
                else { if (animator) animator.SetFloat("Speed", 0f); return; }
            }
            if (next >= waypoints.Length) return;
            if (waypoints[next] == null) { Advance(); return; }
            if (!agent.pathPending && (!agent.hasPath || agent.destination != waypoints[next].position))
                agent.SetDestination(waypoints[next].position);
            if (!agent.pathPending && agent.remainingDistance <= Mathf.Max(agent.stoppingDistance, arrivalDistance))
            {
                waiting = true; until = Time.time + waitSeconds; agent.ResetPath();
            }
            if (animator) animator.SetFloat("Speed", agent.velocity.magnitude, 0.12f, Time.deltaTime);
        }
        void Advance()
        {
            next++;
            if (next >= waypoints.Length && loop) next = 0;
        }
    }
}
