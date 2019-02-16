# 15. Access a Service via DNS

In the previous lab, we saw how various Service types can be used for exposing Pods. This lab is about how to discover Services in a Cluster, with the goal to access a Service from within a Pod.


## Environment variables

A way to discover what Services are available on your cluster is via environment variables. When a Pod is started, Kubernetes provides a set of environment variables for each Service that is present - at the moment of Pod creation. The Pod can then find out the Service address by inspecting the environment variables.

This lab starts with the situation from the previous lab, so a couple of Services are present. Below, we will:

1. Re-create all our Pods by deleting them and letting the ReplicationController start new Pods. That ensures that all Pods have an up-to-date set of environment variables.
2. Inspect the environment variables in a Pod

Let's go.

**Step 1:** recreate Pods:

```bash
developer@developer-VirtualBox:~/projects/k4d$ kubectl delete pod --all
pod "terra10-rc-49zr2" deleted
pod "terra10-rc-dvbqv" deleted
pod "terra10-rc-wmfcl" deleted
developer@developer-VirtualBox:~/projects/k4d$ kubectl get pod
NAME               READY     STATUS    RESTARTS   AGE
terra10-rc-h2svz   1/1       Running   0          42s
terra10-rc-mgtt2   1/1       Running   0          42s
terra10-rc-ndfww   1/1       Running   0          42s
developer@developer-VirtualBox:~/projects/k4d$
```

**Step 2:** inspect environment variables in a Pod

We will use `kubectl exec` to run the `env` command in one of the Pods:

```bash
developer@developer-VirtualBox:~/projects/k4d$ kubectl exec terra10-rc-h2svz env | sort
HOME=/root
HOSTNAME=terra10-rc-h2svz
KUBERNETES_PORT_443_TCP_ADDR=10.96.0.1
KUBERNETES_PORT_443_TCP_PORT=443
KUBERNETES_PORT_443_TCP_PROTO=tcp
KUBERNETES_PORT_443_TCP=tcp://10.96.0.1:443
KUBERNETES_PORT=tcp://10.96.0.1:443
KUBERNETES_SERVICE_HOST=10.96.0.1
KUBERNETES_SERVICE_PORT=443
KUBERNETES_SERVICE_PORT_HTTPS=443
NODE_VERSION=8.12.0
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
TERRA10_LOADBALANCER_PORT_80_TCP_ADDR=10.107.96.23
TERRA10_LOADBALANCER_PORT_80_TCP_PORT=80
TERRA10_LOADBALANCER_PORT_80_TCP_PROTO=tcp
TERRA10_LOADBALANCER_PORT_80_TCP=tcp://10.107.96.23:80
TERRA10_LOADBALANCER_PORT=tcp://10.107.96.23:80
TERRA10_LOADBALANCER_SERVICE_HOST=10.107.96.23
TERRA10_LOADBALANCER_SERVICE_PORT=80
TERRA10_NODEPORT_PORT_80_TCP_ADDR=10.98.157.230
TERRA10_NODEPORT_PORT_80_TCP_PORT=80
TERRA10_NODEPORT_PORT_80_TCP_PROTO=tcp
TERRA10_NODEPORT_PORT_80_TCP=tcp://10.98.157.230:80
TERRA10_NODEPORT_PORT=tcp://10.98.157.230:80
TERRA10_NODEPORT_SERVICE_HOST=10.98.157.230
TERRA10_NODEPORT_SERVICE_PORT=80
TERRA10_PORT_80_TCP_ADDR=10.102.181.8
TERRA10_PORT_80_TCP_PORT=80
TERRA10_PORT_80_TCP_PROTO=tcp
TERRA10_PORT_80_TCP=tcp://10.102.181.8:80
TERRA10_PORT=tcp://10.102.181.8:80
TERRA10_SERVICE_HOST=10.102.181.8
TERRA10_SERVICE_PORT=80
YARN_VERSION=1.9.4
developer@developer-VirtualBox:~/projects/k4d$
```
You can examine the output and see that a set of env variables is present for the services KUBERNETES, TERRA10, TERRA10\_NODEPORT and TERRA10\_LOADBALANCER. That matches with:

```bash
developer@developer-VirtualBox:~/projects/k4d$ kubectl get service
NAME                   TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
kubernetes             ClusterIP      10.96.0.1       <none>        443/TCP        11d
terra10                ClusterIP      10.102.181.8    <none>        80/TCP         5h
terra10-loadbalancer   LoadBalancer   10.107.96.23    <pending>     80:30643/TCP   4h
terra10-nodeport       NodePort       10.98.157.230   <none>        80:30123/TCP   5h
developer@developer-VirtualBox:~/projects/k4d$ 
```
Note how the Service names are translated into env variable names.

The big drawback with this approach is that the Services have to be known before the Pod is started. Wouldn't it be nice to have something like Kubernetes DNS?

## Kubernetes DNS


A Kubernetes platform runs a DNS service. First some discovery stuff...

Look at the Pods in the `kube-system` namespace:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 14$ kubectl get pod -n kube-system 
NAME                                       READY   STATUS    RESTARTS   AGE
coredns-86c58d9df4-fprc7                   1/1     Running   4          45h
coredns-86c58d9df4-s4wxw                   1/1     Running   4          45h
default-http-backend-5ff9d456ff-nftdb      1/1     Running   0          18m
etcd-minikube                              1/1     Running   37         45h
kube-addon-manager-minikube                1/1     Running   37         45h
kube-apiserver-minikube                    1/1     Running   37         45h
kube-controller-manager-minikube           1/1     Running   10         45h
kube-proxy-s9ms7                           1/1     Running   4          45h
kube-scheduler-minikube                    1/1     Running   38         45h
kubernetes-dashboard-ccc79bfc9-2x4pp       1/1     Running   8          45h
metrics-server-6fc4b7bcff-zcgfs            1/1     Running   7          45h
nginx-ingress-controller-7c66d668b-vvsxz   1/1     Running   0          18m
storage-provisioner                        1/1     Running   8          45h
developer@developer-VirtualBox:~/projects/k4d/lab 14$
```
Note the `core-dns-...` Pods in the listing above. 

Look at the services in the `kube-system` namespace:

```bash
developer@developer-VirtualBox:~/projects/k4d$ kubectl get service --namespace=kube-system 
NAME                   TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)         AGE
default-http-backend   NodePort    10.96.244.39    <none>        80:30001/TCP    2h
kube-dns               ClusterIP   10.96.0.10      <none>        53/UDP,53/TCP   11d
kubernetes-dashboard   NodePort    10.106.226.98   <none>        80:30000/TCP    11d
developer@developer-VirtualBox:~/projects/k4d$
```

Yes, there is a Kubernetes DNS! The kube-dns Service routes the calls to the `core-dns-...` Pods.

Now - and this is important - ALL dns calls by all Pods in the Kubernetes Cluster are handled by this Kubernetes DNS. And the Kubernetes DNS knows exactly what Services are running!

**FQDN: Fully Qualified Domain Name**

As a DNS is about translating domain names into IP addresses, we must know how the FQDN of a Kubernetes Service looks like. Well, the format is:
`<service name>.<namespace>.<cluster domain suffix>`

The `cluster domain suffix` is configurable, and by default it is `svc.cluster.local`.

Out 3 services from above have the following FQDN names:

- terra10.default.svc.cluster.local
- terra10-loadbalancer.default.svc.cluster.local
- terra10-nodeport.default.svc.cluster.local

Let's try it by running a curl command from within a Pod:

```bash
developer@developer-VirtualBox:~/projects/k4d$ kubectl exec terra10-rc-h2svz -- curl -s terra10.default.svc.cluster.local
Hello, you landed on Terra10 and host terra10-rc-mgtt2 welcomes you!
developer@developer-VirtualBox:~/projects/k4d$ kubectl exec terra10-rc-h2svz -- curl -s terra10-loadbalancer.default.svc.cluster.local
Hello, you landed on Terra10 and host terra10-rc-ndfww welcomes you!
developer@developer-VirtualBox:~/projects/k4d$ kubectl exec terra10-rc-h2svz -- curl -s terra10-nodeport.default.svc.cluster.local
Hello, you landed on Terra10 and host terra10-rc-ndfww welcomes you!
developer@developer-VirtualBox:~/projects/k4d$ 
````
Clean up!
