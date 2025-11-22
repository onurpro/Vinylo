
class LibraryItem:

    def __init__(self, name, url, mbid):
        self.name = name
        self.url = url
        self.mbid = mbid

class Album(LibraryItem):

    def __init__(self, name, url, mbid, artistName, imageURL):
        super().__init__(name, url, mbid)

        self.artistName = artistName
        self.imageURL = imageURL
        self.playcount = 0

        self.eloScore = 1500
        self.ignored = False

    def to_dict(self):
        return {
            "name": self.name,
            "url": self.url,
            "mbid": self.mbid,
            "artistName": self.artistName,
            "imageURL": self.imageURL,
            "playcount": self.playcount,
            "eloScore": self.eloScore,
            "ignored": self.ignored
        }

    @classmethod
    def from_dict(cls, data):
        album = cls(
            name=data["name"],
            url=data["url"],
            mbid=data["mbid"],
            artistName=data["artistName"],
            imageURL=data["imageURL"]
        )
        album.playcount = data.get("playcount", 0)
        album.eloScore = data.get("eloScore", 1500)
        album.ignored = data.get("ignored", False)
        return album

    def __str__(self):
        return f"{self.name} by {self.artistName} (ELO: {int(self.eloScore)}, Plays: {self.playcount})"