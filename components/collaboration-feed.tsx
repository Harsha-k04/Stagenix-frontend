"use client"

const collaborators = [
  { id: 1, name: "Alex Chen", status: "online", action: "Editing lighting setup" },
  { id: 2, name: "Sarah Johnson", status: "online", action: "Added new stage prop" },
  { id: 3, name: "Mike Davis", status: "away", action: "Commented on design" },
]

export default function CollaborationFeed() {
  return (
    <div className="p-4 space-y-3">
      {collaborators.map((collaborator) => (
        <div key={collaborator.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-start gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-xs font-bold text-primary-foreground">
                {collaborator.name.charAt(0)}
              </div>
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                  collaborator.status === "online" ? "bg-green-500" : "bg-yellow-500"
                }`}
              ></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{collaborator.name}</p>
              <p className="text-xs text-muted-foreground truncate">{collaborator.action}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Typing Indicator */}
      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <p className="text-xs text-muted-foreground ml-2">Someone is typing...</p>
        </div>
      </div>
    </div>
  )
}
