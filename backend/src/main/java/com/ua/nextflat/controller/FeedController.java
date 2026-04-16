package com.ua.nextflat.controller;

import com.ua.nextflat.dto.FeedInmuebleDTO;
import com.ua.nextflat.dto.SwipeRequestDTO;
import com.ua.nextflat.service.FeedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feed")
@CrossOrigin(origins = "http://localhost:5173")
public class FeedController {

    private final FeedService feedService;

    @Autowired
    public FeedController(FeedService feedService) {
        this.feedService = feedService;
    }

    @GetMapping("/{usuarioId}")
    public ResponseEntity<List<FeedInmuebleDTO>> getFeedForUser(@PathVariable Long usuarioId) {
        List<FeedInmuebleDTO> feed = feedService.getFeedForUser(usuarioId);
        return ResponseEntity.ok(feed);
    }

    @PostMapping("/swipe")
    public ResponseEntity<Void> processSwipe(@RequestBody SwipeRequestDTO request) {
        feedService.processSwipe(request);
        return ResponseEntity.ok().build();
    }
}
