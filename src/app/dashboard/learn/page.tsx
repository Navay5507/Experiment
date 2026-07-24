"use client";

import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";
import styles from "./learn.module.css";

export default function LearnPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.title}
        >
          AutoDrop Academy
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={styles.subtitle}
        >
          Watch our latest video tutorials to master Instagram DM automation and scale your business.
        </motion.p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={styles.videoGrid}
      >
        {/* Placeholder Video Card */}
        <div className={styles.videoCard}>
          <div className={styles.videoPlaceholder}>
            <PlayCircle size={48} opacity={0.3} />
          </div>
          <div className={styles.videoInfo}>
            <h3 className={styles.videoTitle}>Getting Started with AutoDrop</h3>
            <p className={styles.videoDesc}>Learn the basics of connecting your Instagram account, building a flow, and launching your first automation.</p>
          </div>
        </div>

        {/* You can copy and paste the block above to add more videos later, replacing the videoPlaceholder with an actual iframe embed */}
        
      </motion.div>
    </div>
  );
}
