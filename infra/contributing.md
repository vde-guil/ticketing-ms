# Contributing

## minikube


minikube quickly sets up a local Kubernetes cluster on macOS, Linux, and Windows

### to start minikube
```sh
$> minikube start --driver=<driver_name>
```

driver_name describe the hypervisor you use (KVM or VirtualBox, docker or none)

To test if minikube is running:

```sh
$> minikube status
```


### to start using kubernetes, ...

...you need to make use of the command ```kubectl```.
with minikube, the command becomes ```minikube kubectl --```
To save some time, create an alias in .bashrc  file or equivalent ```kubectl="minikube kubectl --"```


### creating a Pod (container from docker image)


- You need to create an image of you service/project with ```docker build -t docker_username/project name```

If you are using a vm driver, you will need to tell Kubernetes to use the Docker daemon running inside of the single node cluster instead of the host.

you can set the environment variable of docker to minikube's docker daemon by typing this in the terminal

```sh
eval $(minikube docker-env)
```

(you need to do it again each time you need to build a new image)

- You then need to create the yaml config (pod manifest) file describing your pod and launch a command to run it:

## Kubectl cheatsheet

tells kubernetees to process the config
```sh
kubectl apply -f <config_file.yaml>
```

printout informations about all pods

```sh
kubectl get pods
```

Execute the given command in a running pod

```sh
kubectl exec -it [pod_name] [cmd]
```

Deletes given pod

```sh
kubectl delete pod [pod_name]
```

Print out logs about the running pod

```sh
kubectl logs     [pod_name]
```

Print out information about the running pod

```sh
kubectl describe pod [pod_name]
```

## Deployment

example posts-depl.yaml

```yaml
apiVersion: apps/v1 # deployment is in this bucket of differents object apps/v1
kind: Deployment
metadata:
  name: posts-depl  # name of the deployment
spec:               # specify how deployment should behave
  replicas: 1       # number of pods we want to create running a particular image (3 pods of posts for example)
  selector:         # selector and template/metadata are working together. deployment has hard time manage which pods it should manage inside of cluster
    matchLabels:    # this says take a look at all the pods that have been created, 
      app: posts    # then find the pods labeled "app: posts"
  template:         # template is where we specify the exact configuration of a pod that we want the deployment to create
    metadata:
      labels:
        app: posts
    spec:
      containers:
        - name: posts
          image: vdeguil/msblog-posts:0.0.1
          imagePullPolicy: Never   # here we specify to take the image from local computer, otherwise it will be pulled out of dockerhub
```

## deployment commands

printout informations about all deployments 

```sh
kubectl get deployments
```

Print out information about the running pod

```sh
kubectl describe deployments [depl_name]
```

create deployment out of a config file
```sh
kubectl apply -f <config_file.yaml>
```

Deletes given deployment

```sh
kubectl delete deployment [depl_name]
```

### update image used by a deployment

- deployment must be using 'latest' tag in the pod spec  section (remove imagePullPolicy never)
- make an update to the code
- build the image with latest
- push image to docker hub ```docker push [image_name]```
- run the command ```kubectl rollout restart deployment [depl_name]```

## Networking with Services

different types of services

Cluster IP => sets up easy to remember  URL to access  a pod. Only exposes pods in the cluster
NodePort => for dev purpose, makes pod accessible from out of the cluster
LoadBalancer => to make pod accessible to outer world (front end for example), this is the right way to do it.
External Name => redirect an in cluster request to CNAME url... ??

describe it in yaml file: 

```yaml
apiVersion: v1
kind: Service
metadata:
  name: posts-srv
spec:
  type: NodePort
  selector: # chose which pod's network you should expose
    app: posts
  ports:
    - name: posts
      protocol: TCP
      port: 4000 # port of the node Port service, then the Node Port Service will redirect the communication to the target port (see below)
      targetPort: 4000 # port in application in the pod
```

for NodePOrt: to access in you browser, on creation of service, a nodePort will be randomly attributed, you can check it with the command

```kubectl describe service [srv_name]```

then you can acces with localhost:XXXXX

for minikube, you can't access service through localhost, but through ip address
to find this address type the command

``` minikube service [srv_name]``` or
``` minikube service list``` 

## Creating a secret

``` kubectl create secret generic <secret_name> --from-literal=<key_name>=<value>```

To get list of secrets created, use command

``` kubectl get secrets ```

to give access to secret to our pods, 
we need to add lines to our pods/deployments config files

```yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-depl
spec:
  replicas: 1 # number of pods we want to create running a particular image (3 pods of posts for example)
  selector:
    matchLabels:
      app: auth
  template:
    metadata:
      labels:
        app: auth
    spec:
      containers:
        - name: auth
          image: vdeguil/ticketing-auth:latest
          env: #important part
            - name: <ACCESS_NAME IN  OUR CODE>
              valueFrom:
                secretKeyRef:
                  name: <secret_name>
                  key: <key_name>
```


## Port forwarding pods

strictly for development usage

```kubectl port-forward <pod_name> <port>:<port>```
